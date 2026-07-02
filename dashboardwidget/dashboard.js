(function() {
  // ══════════════════════════════════════════════════
  // NODEWAVE AGENT ESCALATION DASHBOARD
  // Embeddable via <script src="dashboard.js"></script>
  // ══════════════════════════════════════════════════

  // ── Google Fonts ──
  const fontLink = document.createElement('link');
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap';
  fontLink.rel = 'stylesheet';
  document.head.appendChild(fontLink);

  // ── Supabase Config ──
  const SUPABASE_URL = 'https://kzjvawxuubhhvodhmppt.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6anZhd3h1dWJoaHZvZGhtcHB0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjM3OTI2OCwiZXhwIjoyMDk3OTU1MjY4fQ.hIKjM2Op_bJBC6mM57vnQ9alpU54d5IR2BJ9mRCziE8';

  // ── Supabase REST helpers ──
  async function supabaseSelect(table, query) {
    try {
      const res = await fetch(SUPABASE_URL + '/rest/v1/' + table + '?' + query, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY
        }
      });
      if (!res.ok) {
        console.error('[Dashboard] Select error:', res.status);
        return [];
      }
      return await res.json();
    } catch (err) {
      console.error('[Dashboard] Select failed:', err);
      return [];
    }
  }

  async function supabaseInsert(table, row) {
    try {
      const res = await fetch(SUPABASE_URL + '/rest/v1/' + table, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(row)
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error('[Dashboard] Insert error:', res.status, errText);
        return null;
      }
      return await res.json();
    } catch (err) {
      console.error('[Dashboard] Insert failed:', err);
      return null;
    }
  }

  async function supabaseUpdate(table, matchQuery, updateData) {
    try {
      const res = await fetch(SUPABASE_URL + '/rest/v1/' + table + '?' + matchQuery, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(updateData)
      });
      if (!res.ok) {
        console.error('[Dashboard] Update error:', res.status);
        return null;
      }
      return await res.json();
    } catch (err) {
      console.error('[Dashboard] Update failed:', err);
      return null;
    }
  }

  // ── Inject CSS ──
  const style = document.createElement('style');
  style.innerHTML = `
    .nw-dash-container {
      font-family: 'Plus Jakarta Sans', sans-serif;
      position: fixed; inset: 0; z-index: 99999;
      display: flex; background: #0F1117;
      color: #E4E4E7;
    }

    /* ─── Sidebar ─── */
    .nw-dash-sidebar {
      width: 340px; min-width: 340px;
      background: #16181D;
      border-right: 1px solid rgba(255,255,255,0.06);
      display: flex; flex-direction: column;
      overflow: hidden;
    }
    .nw-dash-sidebar-header {
      padding: 20px 24px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      flex-shrink: 0;
    }
    .nw-dash-sidebar-header h2 {
      font-size: 18px; font-weight: 700;
      color: #fff; margin: 0 0 4px 0;
      display: flex; align-items: center; gap: 10px;
    }
    .nw-dash-sidebar-header h2 span.nw-logo-dot {
      width: 10px; height: 10px; border-radius: 50%;
      background: linear-gradient(135deg, #34D399, #10B981);
      display: inline-block;
      box-shadow: 0 0 8px rgba(52,211,153,0.4);
    }
    .nw-dash-sidebar-header p {
      font-size: 12px; color: #71717A; margin: 0;
    }
    .nw-dash-stats {
      display: flex; gap: 12px; padding: 16px 24px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      flex-shrink: 0;
    }
    .nw-dash-stat-card {
      flex: 1; background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 10px; padding: 12px;
      text-align: center;
    }
    .nw-dash-stat-num {
      font-size: 22px; font-weight: 800;
      background: linear-gradient(135deg, #F59E0B, #EF4444);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .nw-dash-stat-num.green {
      background: linear-gradient(135deg, #34D399, #10B981);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .nw-dash-stat-label {
      font-size: 10px; color: #71717A; text-transform: uppercase;
      letter-spacing: 0.05em; margin-top: 2px;
    }
    .nw-dash-list-title {
      font-size: 11px; color: #71717A; text-transform: uppercase;
      letter-spacing: 0.08em; padding: 16px 24px 8px;
      flex-shrink: 0;
    }
    .nw-dash-conv-list {
      flex: 1; overflow-y: auto; padding: 0 12px 12px;
    }
    .nw-dash-conv-list::-webkit-scrollbar { width: 4px; }
    .nw-dash-conv-list::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }

    .nw-dash-conv-item {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 12px; border-radius: 10px;
      cursor: pointer; transition: all 0.2s ease;
      margin-bottom: 2px;
      border: 1px solid transparent;
    }
    .nw-dash-conv-item:hover {
      background: rgba(255,255,255,0.04);
    }
    .nw-dash-conv-item.active {
      background: rgba(52,211,153,0.08);
      border-color: rgba(52,211,153,0.2);
    }
    .nw-dash-conv-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, #2D4030, #3A5A3E);
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 700; color: #E2D7C5;
      flex-shrink: 0;
    }
    .nw-dash-conv-info { flex: 1; min-width: 0; }
    .nw-dash-conv-name {
      font-size: 13px; font-weight: 600; color: #E4E4E7;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .nw-dash-conv-preview {
      font-size: 11px; color: #71717A;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      margin-top: 2px;
    }
    .nw-dash-conv-meta {
      display: flex; flex-direction: column; align-items: flex-end; gap: 4px;
      flex-shrink: 0;
    }
    .nw-dash-conv-time {
      font-size: 10px; color: #52525B;
    }
    .nw-dash-conv-badge {
      width: 8px; height: 8px; border-radius: 50%;
      background: #EF4444;
      box-shadow: 0 0 6px rgba(239,68,68,0.4);
    }
    .nw-dash-conv-badge.resolved {
      background: #10B981;
      box-shadow: 0 0 6px rgba(16,185,129,0.4);
    }

    /* ─── Main Chat Panel ─── */
    .nw-dash-main {
      flex: 1; display: flex; flex-direction: column;
      background: #0F1117;
    }
    .nw-dash-main-header {
      padding: 16px 24px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      display: flex; align-items: center; justify-content: space-between;
      flex-shrink: 0;
    }
    .nw-dash-main-header-info {
      display: flex; align-items: center; gap: 12px;
    }
    .nw-dash-main-header h3 {
      font-size: 15px; font-weight: 600; color: #fff; margin: 0;
    }
    .nw-dash-main-header .nw-email-tag {
      font-size: 11px; color: #71717A; margin: 0;
    }
    .nw-dash-status-badge {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      padding: 4px 10px; border-radius: 20px; letter-spacing: 0.05em;
    }
    .nw-dash-status-badge.escalated {
      background: rgba(239,68,68,0.15); color: #F87171;
    }
    .nw-dash-status-badge.resolved {
      background: rgba(16,185,129,0.15); color: #34D399;
    }
    .nw-dash-resolve-btn {
      background: linear-gradient(135deg, #10B981, #059669);
      color: #fff; border: none; padding: 8px 16px;
      border-radius: 8px; font-size: 12px; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
      margin-left: 8px;
    }
    .nw-dash-resolve-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16,185,129,0.3);
    }

    .nw-dash-messages {
      flex: 1; overflow-y: auto; padding: 24px;
      display: flex; flex-direction: column; gap: 12px;
    }
    .nw-dash-messages::-webkit-scrollbar { width: 4px; }
    .nw-dash-messages::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }

    .nw-dash-msg {
      max-width: 70%; padding: 12px 16px;
      border-radius: 16px; font-size: 13.5px; line-height: 1.55;
      animation: nwDashSlideIn 0.3s ease both;
    }
    @keyframes nwDashSlideIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .nw-dash-msg.user {
      align-self: flex-start;
      background: rgba(255,255,255,0.06);
      color: #E4E4E7;
      border: 1px solid rgba(255,255,255,0.08);
      border-bottom-left-radius: 4px;
    }
    .nw-dash-msg.bot {
      align-self: flex-start;
      background: rgba(45,64,48,0.3);
      color: #A7F3D0;
      border: 1px solid rgba(52,211,153,0.15);
      border-bottom-left-radius: 4px;
      margin-left: 24px;
    }
    .nw-dash-msg.agent {
      align-self: flex-end;
      background: linear-gradient(135deg, #2563EB, #1D4ED8);
      color: #fff;
      border-bottom-right-radius: 4px;
    }
    .nw-dash-msg-label {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.05em; margin-bottom: 4px; opacity: 0.6;
    }
    .nw-dash-msg-time {
      font-size: 9px; opacity: 0.4; margin-top: 4px;
      text-align: right;
    }

    /* ─── Input Area ─── */
    .nw-dash-input-area {
      padding: 16px 24px;
      border-top: 1px solid rgba(255,255,255,0.06);
      flex-shrink: 0;
    }
    .nw-dash-input-wrapper {
      display: flex; align-items: flex-end; gap: 10px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px; padding: 10px 14px;
      transition: border-color 0.2s;
    }
    .nw-dash-input-wrapper:focus-within {
      border-color: rgba(37,99,235,0.5);
    }
    .nw-dash-textarea {
      flex: 1; border: none; background: transparent; resize: none;
      font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13.5px;
      line-height: 1.4; max-height: 100px; outline: none;
      color: #E4E4E7;
    }
    .nw-dash-textarea::placeholder { color: #52525B; }
    .nw-dash-send-btn {
      background: linear-gradient(135deg, #2563EB, #1D4ED8);
      color: #fff; border: none; padding: 8px 18px;
      border-radius: 8px; font-size: 12px; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
      white-space: nowrap;
    }
    .nw-dash-send-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(37,99,235,0.3);
    }
    .nw-dash-send-btn:disabled {
      opacity: 0.4; cursor: default; transform: none; box-shadow: none;
    }

    /* ─── Empty State ─── */
    .nw-dash-empty {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      color: #52525B; text-align: center; gap: 12px;
    }
    .nw-dash-empty-icon {
      font-size: 48px; opacity: 0.3;
    }
    .nw-dash-empty h3 {
      color: #71717A; font-size: 16px; margin: 0;
    }
    .nw-dash-empty p {
      font-size: 13px; max-width: 300px; margin: 0;
    }

    /* ─── Responsive ─── */
    @media (max-width: 768px) {
      .nw-dash-sidebar { width: 100%; min-width: 100%; }
      .nw-dash-main { display: none; }
      .nw-dash-container.chat-open .nw-dash-sidebar { display: none; }
      .nw-dash-container.chat-open .nw-dash-main { display: flex; }
    }
  `;
  document.head.appendChild(style);

  // ── Inject HTML ──
  const container = document.createElement('div');
  container.className = 'nw-dash-container';
  container.id = 'nw-dashboard';
  container.innerHTML = `
    <div class="nw-dash-sidebar">
      <div class="nw-dash-sidebar-header">
        <h2><span class="nw-logo-dot"></span> Escalation Queue</h2>
        <p>Nodewave Agent Dashboard</p>
      </div>
      <div class="nw-dash-stats">
        <div class="nw-dash-stat-card">
          <div class="nw-dash-stat-num" id="nw-stat-active">0</div>
          <div class="nw-dash-stat-label">Active</div>
        </div>
        <div class="nw-dash-stat-card">
          <div class="nw-dash-stat-num green" id="nw-stat-resolved">0</div>
          <div class="nw-dash-stat-label">Resolved</div>
        </div>
      </div>
      <div class="nw-dash-list-title">Conversations</div>
      <div class="nw-dash-conv-list" id="nw-conv-list"></div>
    </div>
    <div class="nw-dash-main" id="nw-main-panel">
      <div class="nw-dash-empty" id="nw-empty-state">
        <div class="nw-dash-empty-icon">💬</div>
        <h3>No conversation selected</h3>
        <p>Select an escalated conversation from the sidebar to view the chat history and reply.</p>
      </div>
    </div>
  `;
  document.body.appendChild(container);

  // ── State ──
  let escalations = [];
  let selectedConvId = null;
  let pollInterval = null;

  // ── DOM Refs ──
  const convListEl = document.getElementById('nw-conv-list');
  const mainPanel = document.getElementById('nw-main-panel');
  const emptyState = document.getElementById('nw-empty-state');
  const statActive = document.getElementById('nw-stat-active');
  const statResolved = document.getElementById('nw-stat-resolved');

  async function fetchEscalations() {
    const data = await supabaseSelect('escalations', 'order=created_at.desc');
    escalations = data || [];
    renderSidebar();
    
    // If we have a selected conversation, just refresh its messages
    if (selectedConvId) {
      const current = escalations.find(e => e.conversation_id === selectedConvId);
      if (current) refreshMessagesOnly(current);
    }
  }

  // ── Render Sidebar ──
  function renderSidebar() {
    const active = escalations.filter(e => e.status === 'escalated');
    const resolved = escalations.filter(e => e.status === 'resolved');
    
    statActive.textContent = active.length;
    statResolved.textContent = resolved.length;

    convListEl.innerHTML = '';
    
    if (escalations.length === 0) {
      convListEl.innerHTML = `
        <div style="text-align:center; padding:40px 20px; color:#52525B; font-size:13px;">
          No escalations yet.<br>They will appear here in real-time.
        </div>
      `;
      return;
    }

    escalations.forEach(esc => {
      const initials = getInitials(esc.user_name || 'WV');
      const preview = esc.last_user_message || 'No message';
      const timeStr = formatTime(esc.escalated_at || esc.created_at);
      const isActive = esc.conversation_id === selectedConvId;
      const isResolved = esc.status === 'resolved';

      const item = document.createElement('div');
      item.className = 'nw-dash-conv-item' + (isActive ? ' active' : '');
      item.innerHTML = `
        <div class="nw-dash-conv-avatar">${initials}</div>
        <div class="nw-dash-conv-info">
          <div class="nw-dash-conv-name">${escapeHtml(esc.user_name || 'Website Visitor')}</div>
          <div class="nw-dash-conv-preview">${escapeHtml(preview.substring(0, 60))}</div>
        </div>
        <div class="nw-dash-conv-meta">
          <div class="nw-dash-conv-time">${timeStr}</div>
          <div class="nw-dash-conv-badge ${isResolved ? 'resolved' : ''}"></div>
        </div>
      `;
      item.addEventListener('click', () => {
        selectedConvId = esc.conversation_id;
        renderSidebar();
        renderChatPanel(esc);
      });
      convListEl.appendChild(item);
    });
  }

  // ── Render Chat Panel ──
  function renderChatPanel(esc) {
    const isResolved = esc.status === 'resolved';
    
    mainPanel.innerHTML = `
      <div class="nw-dash-main-header">
        <div class="nw-dash-main-header-info">
          <div class="nw-dash-conv-avatar" style="width:36px;height:36px;font-size:12px;">${getInitials(esc.user_name || 'WV')}</div>
          <div>
            <h3>${escapeHtml(esc.user_name || 'Website Visitor')}</h3>
            <span class="nw-email-tag">${escapeHtml(esc.user_email || 'No email')}</span>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="nw-dash-status-badge ${isResolved ? 'resolved' : 'escalated'}">${isResolved ? 'Resolved' : 'Escalated'}</span>
          ${!isResolved ? '<button class="nw-dash-resolve-btn" id="nw-resolve-btn">✓ Mark Resolved</button>' : ''}
        </div>
      </div>
      <div class="nw-dash-messages" id="nw-chat-messages"></div>
      ${!isResolved ? `
      <div class="nw-dash-input-area">
        <div class="nw-dash-input-wrapper">
          <textarea class="nw-dash-textarea" id="nw-agent-input" rows="1" placeholder="Type your reply to the customer..."></textarea>
          <button class="nw-dash-send-btn" id="nw-agent-send" disabled>Send Reply</button>
        </div>
      </div>
      ` : ''}
    `;

    // Render chat history
    const msgContainer = document.getElementById('nw-chat-messages');
    renderMessagesHTML(msgContainer, esc);

    // Scroll to bottom
    requestAnimationFrame(() => {
      msgContainer.scrollTo({ top: msgContainer.scrollHeight, behavior: 'instant' });
    });

    // Wire up input
    if (!isResolved) {
      const agentInput = document.getElementById('nw-agent-input');
      const agentSend = document.getElementById('nw-agent-send');
      const resolveBtn = document.getElementById('nw-resolve-btn');

      agentInput.addEventListener('input', () => {
        agentInput.style.height = 'auto';
        agentInput.style.height = Math.min(agentInput.scrollHeight, 100) + 'px';
        agentSend.disabled = !agentInput.value.trim();
      });

      agentInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if (!agentSend.disabled) sendAgentReply(esc, agentInput, msgContainer);
        }
      });

      agentSend.addEventListener('click', () => {
        sendAgentReply(esc, agentInput, msgContainer);
      });

      if (resolveBtn) {
        resolveBtn.addEventListener('click', () => resolveConversation(esc));
      }
    }
  }

  function renderMessagesHTML(msgContainer, esc) {
    msgContainer.innerHTML = '';
    let history = [];
    try {
      history = JSON.parse(esc.chat_history || '[]');
    } catch (e) {
      history = [];
    }

    history.forEach(msg => {
      const div = document.createElement('div');
      const roleClass = msg.role === 'user' ? 'user' : (msg.role === 'agent' ? 'agent' : 'bot');
      const label = msg.role === 'user' ? 'Customer' : (msg.role === 'agent' ? 'Agent' : 'AI Bot');
      div.className = 'nw-dash-msg ' + roleClass;
      div.innerHTML = `
        <div class="nw-dash-msg-label">${label}</div>
        ${escapeHtml(msg.text || '').replace(/\n/g, '<br>')}
        <div class="nw-dash-msg-time">${msg.timestamp ? formatTime(msg.timestamp) : ''}</div>
      `;
      msgContainer.appendChild(div);
    });

    // Also load agent_replies for this conversation
    loadAgentReplies(esc.conversation_id, msgContainer);
  }

  async function loadAgentReplies(convId, msgContainer) {
    const replies = await supabaseSelect('agent_replies', 'conversation_id=eq.' + convId + '&order=created_at.asc');
    replies.forEach(reply => {
      const div = document.createElement('div');
      div.className = 'nw-dash-msg agent';
      div.innerHTML = `
        <div class="nw-dash-msg-label">Agent</div>
        ${escapeHtml(reply.message || '').replace(/\n/g, '<br>')}
        <div class="nw-dash-msg-time">${formatTime(reply.created_at)}</div>
      `;
      msgContainer.appendChild(div);
    });
  }

  function refreshMessagesOnly(esc) {
    const msgContainer = document.getElementById('nw-chat-messages');
    if (!msgContainer) return;
    
    // We only want to auto-scroll if the user is already at the bottom
    const isAtBottom = msgContainer.scrollHeight - msgContainer.scrollTop <= msgContainer.clientHeight + 50;
    
    renderMessagesHTML(msgContainer, esc);
    
    if (isAtBottom) {
      requestAnimationFrame(() => {
        msgContainer.scrollTo({ top: msgContainer.scrollHeight, behavior: 'instant' });
      });
    }
  }

  async function sendAgentReply(esc, inputEl, msgContainer) {
    const text = inputEl.value.trim();
    if (!text) return;

    inputEl.value = '';
    inputEl.style.height = 'auto';
    document.getElementById('nw-agent-send').disabled = true;

    // Add to UI immediately
    const div = document.createElement('div');
    div.className = 'nw-dash-msg agent';
    div.innerHTML = `
      <div class="nw-dash-msg-label">Agent</div>
      ${escapeHtml(text).replace(/\n/g, '<br>')}
      <div class="nw-dash-msg-time">Just now</div>
    `;
    msgContainer.appendChild(div);
    requestAnimationFrame(() => {
      msgContainer.scrollTo({ top: msgContainer.scrollHeight, behavior: 'smooth' });
    });

    // Insert into Supabase agent_replies table
    await supabaseInsert('agent_replies', {
      conversation_id: esc.conversation_id,
      role: 'agent',
      message: text,
      created_at: new Date().toISOString()
    });

    // Also update the chat_history in escalations table (append agent message)
    let history = [];
    try { history = JSON.parse(esc.chat_history || '[]'); } catch(e) {}
    history.push({ role: 'agent', text: text, timestamp: new Date().toISOString() });
    esc.chat_history = JSON.stringify(history);

    await supabaseUpdate('escalations',
      'conversation_id=eq.' + esc.conversation_id,
      { chat_history: esc.chat_history }
    );
  }

  async function resolveConversation(esc) {
    await supabaseUpdate('escalations',
      'conversation_id=eq.' + esc.conversation_id,
      { status: 'resolved' }
    );
    esc.status = 'resolved';
    renderSidebar();
    renderChatPanel(esc);
  }

  // ── Utilities ──
  function getInitials(name) {
    if (!name) return 'WV';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }

  function formatTime(dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now - d;
      const diffMin = Math.floor(diffMs / 60000);
      
      if (diffMin < 1) return 'Just now';
      if (diffMin < 60) return diffMin + 'm ago';
      
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return diffHr + 'h ago';
      
      const diffDay = Math.floor(diffHr / 24);
      if (diffDay < 7) return diffDay + 'd ago';
      
      return d.toLocaleDateString();
    } catch(e) {
      return '';
    }
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  // ── Initialize ──
  fetchEscalations();

  // Poll every 5 seconds for new escalations (Supabase REST, zero n8n cost)
  pollInterval = setInterval(fetchEscalations, 5000);

})();
