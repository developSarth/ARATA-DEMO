// ═══════════════════════════════════════
// Nodewave Helpdesk — Main Logic (helpdesk.js)
// Auth & DB helpers are loaded from auth.js
// supabaseClient, dbSelect, dbInsert, dbUpdate, dbDelete are globally available
// ═══════════════════════════════════════

  // State
  let escalations = [];
  let selectedConvId = null;
  let pollInterval = null;
  let currentTab = 'all';
  let composerMode = 'reply'; // 'reply' or 'private'
  let agentsList = [];
  let searchQuery = '';
  let sortOrder = 'desc'; // 'asc' = A-Z, 'desc' = Z-A (default chronological)
  let currentAgentSession = null; // store session for profile popup

  // ─── Auth Tab Switching ───
  window.switchAuthTab = function(tab) {
    const tabs = ['login', 'register', 'otp'];
    tabs.forEach(t => {
      const form = document.getElementById('form-' + t);
      const tabBtn = document.getElementById('tab-' + t);
      if (t === tab) {
        if (form) form.classList.remove('hidden');
        if (tabBtn) { tabBtn.classList.remove('auth-tab-inactive'); tabBtn.classList.add('auth-tab-active'); }
      } else {
        if (form) form.classList.add('hidden');
        if (tabBtn) { tabBtn.classList.remove('auth-tab-active'); tabBtn.classList.add('auth-tab-inactive'); }
      }
    });
    // Update title
    const title = document.getElementById('auth-title');
    if (tab === 'login') title.textContent = 'Agent Login';
    else if (tab === 'register') title.textContent = 'Create Account';
    else if (tab === 'otp') title.textContent = 'Login with OTP';
    // Clear errors
    hideAuthMessages();
  };

  function hideAuthMessages() {
    const errEl = document.getElementById('login-error');
    const succEl = document.getElementById('login-success');
    if (errEl) errEl.classList.add('hidden');
    if (succEl) succEl.classList.add('hidden');
  }

  function showAuthError(msg) {
    const el = document.getElementById('login-error');
    if (el) { el.textContent = msg; el.classList.remove('hidden'); }
  }

  function showAuthSuccess(msg) {
    const el = document.getElementById('login-success');
    if (el) { el.textContent = msg; el.classList.remove('hidden'); }
  }

  // ─── Conversation Tabs ───
  window.setTab = function(tabName) {
    currentTab = tabName;
    document.querySelectorAll('.nw-tab-btn').forEach(btn => {
      btn.classList.remove('text-primary', 'border-b-2', 'border-primary');
      btn.classList.add('text-on-surface-variant');
    });
    const activeBtn = document.getElementById('nw-tab-' + tabName);
    if (activeBtn) {
      activeBtn.classList.remove('text-on-surface-variant');
      activeBtn.classList.add('text-primary', 'border-b-2', 'border-primary');
    }
    renderSidebar();
  };

  // ─── Sort Toggle (A-Z / Z-A by name) ───
  window.toggleSort = function() {
    sortOrder = (sortOrder === 'asc') ? 'desc' : 'asc';
    const icon = document.getElementById('nw-sort-icon');
    if (icon) {
      icon.textContent = sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward';
      icon.title = sortOrder === 'asc' ? 'Sorted A → Z' : 'Sorted Z → A';
    }
    renderSidebar();
  };

  // ═══════════════════════════════════════
  // Toolbar Formatting Functions
  // ═══════════════════════════════════════
  window.fmtWrap = function(before, after) {
    const ta = document.getElementById('nw-agent-input');
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = ta.value;
    const selected = text.substring(start, end);
    const replacement = before + (selected || 'text') + after;
    ta.value = text.substring(0, start) + replacement + text.substring(end);
    // Position cursor inside the wrapping if nothing was selected
    if (!selected) {
      ta.selectionStart = start + before.length;
      ta.selectionEnd = start + before.length + 4; // select 'text'
    } else {
      ta.selectionStart = start;
      ta.selectionEnd = start + replacement.length;
    }
    ta.focus();
    ta.dispatchEvent(new Event('input'));
  };

  window.fmtLine = function(prefix) {
    const ta = document.getElementById('nw-agent-input');
    if (!ta) return;
    const start = ta.selectionStart;
    const text = ta.value;
    // Find the start of the current line
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    ta.value = text.substring(0, lineStart) + prefix + text.substring(lineStart);
    ta.selectionStart = ta.selectionEnd = start + prefix.length;
    ta.focus();
    ta.dispatchEvent(new Event('input'));
  };

  window.fmtLink = function() {
    const ta = document.getElementById('nw-agent-input');
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = ta.value;
    const selected = text.substring(start, end);
    const url = prompt('Enter URL:', 'https://');
    if (!url) return;
    const linkText = selected || 'link text';
    const replacement = '[' + linkText + '](' + url + ')';
    ta.value = text.substring(0, start) + replacement + text.substring(end);
    ta.selectionStart = start;
    ta.selectionEnd = start + replacement.length;
    ta.focus();
    ta.dispatchEvent(new Event('input'));
  };

  // ═══════════════════════════════════════
  // Emoji Picker
  // ═══════════════════════════════════════
  const EMOJI_DATA = {
    '😀 Smileys': ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🫢','🤫','🤔','🫡','🤐','🤨','😐','😑','😶','🫠','😏','😒','🙄','😬','😮‍💨','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🥴','😵','🤯','🥳','🥸','😎','🤓','🧐'],
    '👋 Gestures': ['👋','🤚','🖐️','✋','🖖','🫱','🫲','🫳','🫴','👌','🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','🫵','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤝','🙏','✍️','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🧠','🫀','🫁','🦷','🦴','👀','👁️','👅','👄'],
    '❤️ Hearts': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','❣️','💕','💞','💓','💗','💖','💘','💝','💟','♥️','🫶','💯','💢','💥','💫','💦','💨','🕳️','💬','👁️‍🗨️','🗨️','🗯️','💭','💤'],
    '🎉 Objects': ['🎉','🎊','🎈','🎁','🎀','🏆','🏅','🥇','🥈','🥉','⚽','🏀','🏈','⚾','🎾','🏐','🎯','🔔','🎵','🎶','🎤','🎧','📱','💻','⌨️','🖥️','🖨️','📷','📹','🎬','📺','📻','⏰','⏱️','📡','🔋','💡','🔦','🕯️','📚','📖','✏️','📝','📎','📌','📍','✂️','🔑','🔒','🔓'],
    '🌍 Nature': ['🌍','🌎','🌏','🌐','🗺️','🧭','⛰️','🌋','🗻','🏕️','🏖️','🏜️','🏝️','☀️','🌤️','⛅','🌥️','☁️','🌦️','🌧️','⛈️','🌩️','🌨️','❄️','☃️','⛄','🌬️','💨','🌪️','🌫️','🌈','🌸','💐','🌹','🥀','🌻','🌼','🌷','🌱','🪴','🌲','🌳','🌴','🌵','🍀','🍁','🍂','🍃','🪵','🪨','🍄'],
    '🍕 Food': ['🍕','🍔','🍟','🌭','🥪','🌮','🌯','🫔','🥙','🧆','🥚','🍳','🥘','🍲','🫕','🥣','🥗','🍿','🧈','🧂','🥫','🍱','🍘','🍙','🍚','🍛','🍜','🍝','🍠','🍢','🍣','🍤','🍥','🥮','🍡','🥟','🥠','🥡','🦀','🦞','🦐','🦑','🦪','🍦','🍧','🍨','🍩','🍪','🎂','🍰','🧁','🥧','🍫','🍬','🍭','🍮','🍯','☕','🫖','🍵','🧃','🥤','🧋','🍶','🍺','🍻','🥂','🍷']
  };
  let emojiPickerOpen = false;
  let activeEmojiCategory = null;

  window.toggleEmojiPicker = function() {
    const picker = document.getElementById('nw-emoji-picker');
    if (!picker) return;
    emojiPickerOpen = !emojiPickerOpen;
    picker.classList.toggle('hidden', !emojiPickerOpen);
    if (emojiPickerOpen) {
      buildEmojiTabs();
      const firstCat = Object.keys(EMOJI_DATA)[0];
      showEmojiCategory(firstCat);
      document.getElementById('nw-emoji-search').value = '';
      document.getElementById('nw-emoji-search').focus();
    }
  };

  function buildEmojiTabs() {
    const tabsEl = document.getElementById('nw-emoji-tabs');
    if (!tabsEl) return;
    tabsEl.innerHTML = '';
    Object.keys(EMOJI_DATA).forEach(cat => {
      const icon = cat.split(' ')[0];
      const btn = document.createElement('button');
      btn.className = 'p-1.5 rounded hover:bg-surface-container-high text-[16px] transition-colors shrink-0';
      btn.textContent = icon;
      btn.title = cat;
      btn.onclick = () => showEmojiCategory(cat);
      tabsEl.appendChild(btn);
    });
  }

  function showEmojiCategory(cat) {
    activeEmojiCategory = cat;
    const grid = document.getElementById('nw-emoji-grid');
    if (!grid) return;
    grid.innerHTML = '';
    EMOJI_DATA[cat].forEach(emoji => {
      const btn = document.createElement('button');
      btn.className = 'w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container-high text-[20px] transition-colors cursor-pointer';
      btn.textContent = emoji;
      btn.onclick = () => insertEmoji(emoji);
      grid.appendChild(btn);
    });
  }

  function insertEmoji(emoji) {
    const ta = document.getElementById('nw-agent-input');
    if (!ta) return;
    const start = ta.selectionStart;
    const text = ta.value;
    ta.value = text.substring(0, start) + emoji + text.substring(start);
    ta.selectionStart = ta.selectionEnd = start + emoji.length;
    ta.focus();
    ta.dispatchEvent(new Event('input'));
  }

  // Emoji search
  document.addEventListener('DOMContentLoaded', () => {
    const searchEl = document.getElementById('nw-emoji-search');
    if (searchEl) {
      searchEl.addEventListener('input', () => {
        const q = searchEl.value.trim().toLowerCase();
        const grid = document.getElementById('nw-emoji-grid');
        if (!grid) return;
        if (!q) {
          showEmojiCategory(activeEmojiCategory || Object.keys(EMOJI_DATA)[0]);
          return;
        }
        // Show all emojis across all categories
        grid.innerHTML = '';
        Object.values(EMOJI_DATA).flat().forEach(emoji => {
          // Simple filter: show all if query is short, otherwise user can scroll
          const btn = document.createElement('button');
          btn.className = 'w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container-high text-[20px] transition-colors cursor-pointer';
          btn.textContent = emoji;
          btn.onclick = () => insertEmoji(emoji);
          grid.appendChild(btn);
        });
      });
    }
  });

  // Close emoji picker on outside click
  document.addEventListener('click', (e) => {
    if (!emojiPickerOpen) return;
    const picker = document.getElementById('nw-emoji-picker');
    const btn = document.getElementById('nw-emoji-btn');
    if (picker && btn && !picker.contains(e.target) && !btn.contains(e.target)) {
      emojiPickerOpen = false;
      picker.classList.add('hidden');
    }
  });

  // ─── Composer Mode (Reply / Private Note) ───
  window.setComposerMode = function(mode) {
    composerMode = mode;
    const replyTab = document.getElementById('nw-tab-reply');
    const privateTab = document.getElementById('nw-tab-private');
    const composerBox = document.getElementById('nw-composer-box');
    const input = document.getElementById('nw-agent-input');
    const sendBtn = document.getElementById('nw-agent-send');

    if (mode === 'private') {
      replyTab.className = 'px-4 py-2 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-colors';
      privateTab.className = 'px-4 py-2 font-label-md text-label-md text-tertiary-container bg-surface-container relative';
      privateTab.innerHTML = 'Private Note <div class="absolute bottom-0 left-0 w-full h-0.5 bg-tertiary-container"></div>';
      composerBox.classList.add('private-note-mode');
      input.placeholder = 'Write a private note... Labels clicked will be appended here.';
      sendBtn.textContent = 'Save Note';
      sendBtn.classList.replace('bg-primary-container', 'bg-tertiary-container');
    } else {
      replyTab.className = 'px-4 py-2 font-label-md text-label-md text-primary bg-surface-container relative';
      replyTab.innerHTML = 'Reply <div class="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>';
      privateTab.className = 'px-4 py-2 font-label-md text-label-md text-tertiary-container hover:bg-surface-container transition-colors';
      privateTab.textContent = 'Private Note';
      composerBox.classList.remove('private-note-mode');
      input.placeholder = "Shift + enter for new line. Start with '/' to select a Canned Response.";
      sendBtn.innerHTML = 'Send <span class="opacity-70 text-[10px] ml-1">(⌘ + ↵)</span>';
      sendBtn.classList.replace('bg-tertiary-container', 'bg-primary-container');
    }
  };

  // ─── Label Click → Append to Private Note ───
  window.addLabelToNote = function(labelName) {
    const input = document.getElementById('nw-agent-input');
    // Switch to private note mode if not already
    if (composerMode !== 'private') {
      setComposerMode('private');
    }
    // Append label tag
    const tag = '#' + labelName + ' ';
    if (!input.value.includes('#' + labelName)) {
      input.value += tag;
    }
    input.focus();
    // Enable send
    const sendBtn = document.getElementById('nw-agent-send');
    if (sendBtn) sendBtn.disabled = !input.value.trim();
  };

  // ─── Agent Dropdown ───
  window.toggleAgentDropdown = function() {
    const dropdown = document.getElementById('agent-dropdown-list');
    dropdown.classList.toggle('open');
  };

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('agent-dropdown-list');
    const trigger = document.getElementById('agent-dropdown-trigger');
    if (dropdown && trigger && !trigger.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });

  async function fetchAgents() {
    agentsList = await dbSelect('agents', 'id,name,email,status', {}, { column: 'created_at', ascending: true });
    renderAgentDropdown();
  }

  function renderAgentDropdown() {
    const dropdown = document.getElementById('agent-dropdown-list');
    if (!dropdown) return;
    dropdown.innerHTML = '';
    
    if (agentsList.length === 0) {
      dropdown.innerHTML = '<div class="p-3 text-center font-body-sm text-on-surface-variant">No agents found</div>';
      return;
    }

    agentsList.forEach(agent => {
      const name = agent.name || agent.email || 'Agent';
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      const statusColor = agent.status === 'online' ? '#10B981' : '#6B7280';
      
      const item = document.createElement('button');
      item.className = 'w-full flex items-center gap-3 p-3 hover:bg-surface-container-high transition-colors text-left';
      item.innerHTML = `
        <div class="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-[10px] text-on-surface shrink-0">${initials}</div>
        <div class="flex-1 min-w-0">
          <span class="font-body-sm text-on-surface truncate block">${escapeHtml(name)}</span>
        </div>
        <span class="w-2 h-2 rounded-full shrink-0" style="background: ${statusColor}"></span>
      `;
      item.onclick = () => {
        // Just viewing, not assigning — update display
        const agentNameEl = document.getElementById('agent-name');
        const agentAvatarEl = document.getElementById('agent-avatar');
        if (agentNameEl) agentNameEl.textContent = name;
        if (agentAvatarEl) agentAvatarEl.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=random';
        dropdown.classList.remove('open');
      };
      dropdown.appendChild(item);
    });
  }

  // DOM Refs
  const convListEl = document.getElementById('nw-conv-list');
  const mainPanel = document.getElementById('nw-main-panel');
  const emptyState = document.getElementById('nw-empty-state');
  const statOpen = document.getElementById('nw-stat-escalated');
  const statAll = document.getElementById('nw-stat-all');
  const statResolved = document.getElementById('nw-stat-resolved');

  // Utility
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }
  function formatTime(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    let h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12; h = h ? h : 12;
    return h + ':' + m + ' ' + ampm;
  }
  function getInitials(name) {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  }

  // Fetch
  let lastEscalationsHash = '';

  async function fetchEscalations() {
    const data = await dbSelect('escalations', '*', {}, { column: 'created_at', ascending: false });
    const newData = data || [];
    
    // Smart diff: only re-render if data actually changed
    const newHash = JSON.stringify(newData.map(e => e.conversation_id + '|' + e.status + '|' + (e.chat_history || '').length + '|' + (e.user_name || '')));
    if (newHash === lastEscalationsHash) return; // No change — skip re-render
    lastEscalationsHash = newHash;
    
    escalations = newData;
    renderSidebar();
    
    if (selectedConvId) {
      const current = escalations.find(e => e.conversation_id === selectedConvId);
      if (current) refreshMessagesOnly(current);
    }
  }

  function renderSidebar() {
    convListEl.innerHTML = '';
    const activeCount = escalations.filter(e => e.status !== 'resolved').length;
    const escalatedCount = escalations.filter(e => e.status === 'escalated').length;
    const resolvedCount = escalations.filter(e => e.status === 'resolved').length;
    if (statOpen) statOpen.textContent = escalatedCount;
    if (statAll) statAll.textContent = activeCount;
    if (statResolved) statResolved.textContent = resolvedCount;

    let filtered = escalations;
    if (currentTab === 'all') {
      // All Chats excludes resolved conversations
      filtered = escalations.filter(e => e.status !== 'resolved');
    } else if (currentTab === 'escalated') {
      filtered = escalations.filter(e => e.status === 'escalated');
    } else if (currentTab === 'resolved') {
      filtered = escalations.filter(e => e.status === 'resolved');
    }

    // Apply keyword search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(esc => {
        // Search in name, email, last message
        if ((esc.user_name || '').toLowerCase().includes(q)) return true;
        if ((esc.user_email || '').toLowerCase().includes(q)) return true;
        if ((esc.last_user_message || '').toLowerCase().includes(q)) return true;
        // Deep search inside chat_history
        try {
          const history = JSON.parse(esc.chat_history || '[]');
          return history.some(msg => (msg.text || '').toLowerCase().includes(q));
        } catch(e) { return false; }
      });
    }

    // Apply sort by name
    filtered.sort((a, b) => {
      const nameA = (a.user_name || 'Visitor').toLowerCase();
      const nameB = (b.user_name || 'Visitor').toLowerCase();
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

    filtered.forEach(esc => {
      const isActive = esc.conversation_id === selectedConvId;
      const activeClass = isActive ? 'bg-surface-container-highest border-l-2 border-primary' : 'hover:bg-surface-container-highest border-l-2 border-transparent';
      
      let statusBadge = '';
      if (esc.status === 'resolved') {
        statusBadge = '<span class="px-2 py-0.5 rounded border border-outline-variant font-label-xs text-label-xs text-on-surface flex items-center gap-1 bg-surface-container-highest"><span class="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span> Resolved</span>';
      } else if (esc.status === 'escalated') {
        statusBadge = '<span class="px-2 py-0.5 rounded border border-outline-variant font-label-xs text-label-xs text-on-surface flex items-center gap-1 bg-surface-container-highest"><span class="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span> Escalated</span>';
      } else {
        statusBadge = '<span class="px-2 py-0.5 rounded border border-outline-variant font-label-xs text-label-xs text-on-surface flex items-center gap-1 bg-surface-container-highest"><span class="w-1.5 h-1.5 rounded-full bg-[#3B82F6]"></span> Active</span>';
      }

      // Show user name if available
      const displayName = esc.user_name && esc.user_name !== 'Website Visitor' ? esc.user_name : (esc.user_name || 'Visitor');

      // Delete button only for resolved chats
      const deleteBtn = esc.status === 'resolved' ? `<button class="nw-delete-btn p-1 rounded hover:bg-error-container/30 text-on-surface-variant hover:text-error transition-colors shrink-0" title="Delete permanently" data-conv-id="${esc.conversation_id}"><span class="material-symbols-outlined text-[16px]">delete</span></button>` : '';

      const div = document.createElement('div');
      div.className = 'p-4 border-b border-outline-variant transition-colors cursor-pointer ' + activeClass;
      div.innerHTML = `
        <div class="flex gap-3">
          <div class="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-on-surface shrink-0">
            ${getInitials(displayName)}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-start mb-0.5">
              <h3 class="font-label-md text-label-md font-bold text-on-surface truncate">${escapeHtml(displayName)}</h3>
              <div class="flex items-center gap-1 shrink-0">
                <span class="font-label-xs text-label-xs text-on-surface-variant">${formatTime(esc.created_at)}</span>
                ${deleteBtn}
              </div>
            </div>
            <p class="font-body-sm text-body-sm text-on-surface-variant truncate mb-2">${escapeHtml(esc.last_user_message || 'New conversation')}</p>
            <div class="flex gap-1.5 flex-wrap">
              ${statusBadge}
            </div>
          </div>
        </div>
      `;
      div.onclick = (e) => {
        // Don't open chat if delete button was clicked
        if (e.target.closest('.nw-delete-btn')) return;
        selectedConvId = esc.conversation_id;
        renderSidebar();
        renderChatPanel(esc);
      };

      // Bind delete button
      const delBtn = div.querySelector('.nw-delete-btn');
      if (delBtn) {
        delBtn.onclick = (e) => {
          e.stopPropagation();
          deleteConversation(esc.conversation_id);
        };
      }

      convListEl.appendChild(div);
    });
  }

  // ─── Delete Conversation ───
  async function deleteConversation(convId) {
    if (!confirm('Permanently delete this conversation? This action cannot be undone.')) return;

    // Delete child records first (agent_replies)
    await dbDelete('agent_replies', 'conversation_id', convId);
    // Delete the escalation record
    await dbDelete('escalations', 'conversation_id', convId);

    // Clear the panel if this was the active chat
    if (selectedConvId === convId) {
      selectedConvId = null;
      mainPanel.classList.add('hidden');
      emptyState.classList.remove('hidden');
    }

    // Refresh
    await fetchEscalations();
  }

  function renderChatPanel(esc) {
    emptyState.classList.add('hidden');
    mainPanel.classList.remove('hidden');

    const displayName = esc.user_name || 'Visitor';
    const displayEmail = esc.user_email || '';

    const elChatName = document.getElementById('nw-chat-name');
    if (elChatName) elChatName.textContent = displayName;
    
    const elChatEmail = document.getElementById('nw-chat-email');
    if (elChatEmail) elChatEmail.textContent = displayEmail;

    const elChatAvatar = document.getElementById('nw-chat-avatar');
    if (elChatAvatar) elChatAvatar.textContent = getInitials(displayName);

    // Update right panel contact info
    const elContactName = document.getElementById('nw-contact-name');
    const elContactEmail = document.getElementById('nw-contact-email');
    if (elContactName) elContactName.textContent = displayName;
    if (elContactEmail) elContactEmail.textContent = displayEmail || '—';

    const btnResolve = document.getElementById('nw-btn-resolve');
    if (esc.status === 'resolved') {
      btnResolve.innerHTML = '<span class="material-symbols-outlined text-[18px]">check</span> Resolved';
      btnResolve.classList.replace('bg-[#22C55E]', 'bg-[#10B981]');
      btnResolve.disabled = true;
    } else {
      btnResolve.innerHTML = '<span class="material-symbols-outlined text-[18px]">check</span> Resolve';
      btnResolve.classList.replace('bg-[#10B981]', 'bg-[#22C55E]');
      btnResolve.disabled = false;
      btnResolve.onclick = () => resolveConversation(esc);
    }

    const msgContainer = document.getElementById('nw-chat-messages');
    renderMessagesHTML(msgContainer, esc);
    
    setTimeout(() => {
      msgContainer.scrollTo({ top: msgContainer.scrollHeight, behavior: 'instant' });
    }, 100);

    // Load private notes for this conversation
    loadPrivateNotes(esc.conversation_id);

    const input = document.getElementById('nw-agent-input');
    const send = document.getElementById('nw-agent-send');
    
    // Reset composer to reply mode
    setComposerMode('reply');
    input.value = '';
    send.disabled = true;
    
    input.oninput = () => { send.disabled = !input.value.trim(); };
    input.onkeydown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!send.disabled) {
          if (composerMode === 'private') {
            savePrivateNote(esc.conversation_id, input);
          } else {
            sendAgentReply(esc.conversation_id, input, msgContainer);
          }
        }
      }
    };
    send.onclick = () => {
      if (composerMode === 'private') {
        savePrivateNote(esc.conversation_id, input);
      } else {
        sendAgentReply(esc.conversation_id, input, msgContainer);
      }
    };
  }

  function renderMessagesHTML(msgContainer, esc) {
    msgContainer.innerHTML = '';
    let history = [];
    try { history = JSON.parse(esc.chat_history || '[]'); } catch(e) {}

    history.forEach(msg => {
      const role = msg.role;
      const isAgent = (role === 'agent' || role === 'bot');
      const time = msg.timestamp ? formatTime(msg.timestamp) : '';
      
      const div = document.createElement('div');
      
      if (isAgent) {
        div.className = 'flex gap-2 max-w-[85%] self-end mt-4';
        div.innerHTML = `
          <div class="flex flex-col gap-1 items-end w-full">
            <div class="bg-primary-container text-[#ffffff] font-body-sm text-body-sm p-4 rounded-2xl rounded-tr-sm shadow-sm flex flex-col gap-3">
              <p>${escapeHtml(msg.text || '').replace(/\n/g, '<br>')}</p>
            </div>
            <div class="flex items-center gap-2 text-[10px] text-on-surface-variant font-label-xs">
              <span>${time}</span>
            </div>
          </div>
          <div class="w-6 h-6 rounded-full shrink-0 self-end mb-5 bg-primary-container flex items-center justify-center font-bold text-[10px] text-white">A</div>
        `;
      } else {
        div.className = 'flex gap-2 max-w-[85%] self-start mt-4';
        div.innerHTML = `
          <div class="w-6 h-6 rounded-full shrink-0 self-end mb-5 bg-surface-container-highest flex items-center justify-center font-bold text-[10px] text-on-surface">${getInitials(esc.user_name)}</div>
          <div class="flex flex-col gap-1 items-start w-full">
            <div class="bg-surface-container-highest text-on-surface font-body-sm text-body-sm p-4 rounded-2xl rounded-tl-sm shadow-sm flex flex-col gap-3">
              <p>${escapeHtml(msg.text || '').replace(/\n/g, '<br>')}</p>
            </div>
            <div class="flex items-center gap-2 text-[10px] text-on-surface-variant font-label-xs">
              <span>${time}</span>
            </div>
          </div>
        `;
      }
      msgContainer.appendChild(div);
    });

    loadAgentReplies(esc.conversation_id, msgContainer);
  }

  async function loadAgentReplies(convId, msgContainer) {
    const replies = await dbSelect('agent_replies', '*', { conversation_id: convId }, { column: 'created_at', ascending: true });
    
    // Build a set of messages already rendered from chat_history to de-duplicate
    const existingMsgs = new Set();
    const currentEsc = escalations.find(e => e.conversation_id === convId);
    if (currentEsc) {
      try {
        const history = JSON.parse(currentEsc.chat_history || '[]');
        history.forEach(msg => {
          if (msg.role === 'agent' || msg.role === 'bot') {
            existingMsgs.add((msg.text || '').trim());
          }
        });
      } catch(e) {}
    }
    
    replies.forEach(reply => {
      // Skip private notes
      if (reply.is_private) return;
      // Skip if this message already exists in chat_history (prevents double-render)
      if (existingMsgs.has((reply.message || '').trim())) return;
      
      const div = document.createElement('div');
      div.className = 'flex gap-2 max-w-[85%] self-end mt-4';
      div.innerHTML = `
        <div class="flex flex-col gap-1 items-end w-full">
          <div class="bg-primary-container text-[#ffffff] font-body-sm text-body-sm p-4 rounded-2xl rounded-tr-sm shadow-sm flex flex-col gap-3">
            <p>${escapeHtml(reply.message || '').replace(/\n/g, '<br>')}</p>
          </div>
          <div class="flex items-center gap-2 text-[10px] text-on-surface-variant font-label-xs">
            <span>${formatTime(reply.created_at)}</span>
          </div>
        </div>
        <div class="w-6 h-6 rounded-full shrink-0 self-end mb-5 bg-primary-container flex items-center justify-center font-bold text-[10px] text-white">A</div>
      `;
      msgContainer.appendChild(div);
    });
  }

  // ─── Private Notes ───
  async function loadPrivateNotes(convId) {
    const notesContainer = document.getElementById('nw-private-notes-list');
    if (!notesContainer) return;
    
    let notes = await dbSelect('agent_replies', '*', { conversation_id: convId, is_private: true }, { column: 'created_at', ascending: false });
    
    notesContainer.innerHTML = '';
    if (notes.length === 0) {
      notesContainer.innerHTML = '<p class="font-body-sm text-on-surface-variant italic">No private notes yet.</p>';
      return;
    }

    notes.forEach(note => {
      const noteEl = document.createElement('div');
      noteEl.className = 'p-2.5 rounded-lg bg-[#2a2615] border border-[#5b4300]/50 flex flex-col gap-1';
      noteEl.innerHTML = `
        <p class="font-body-sm text-tertiary-fixed">${escapeHtml(note.message).replace(/\n/g, '<br>')}</p>
        <span class="font-label-xs text-on-surface-variant">${formatTime(note.created_at)}</span>
      `;
      notesContainer.appendChild(noteEl);
    });
  }

  async function savePrivateNote(convId, inputEl) {
    const text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';
    document.getElementById('nw-agent-send').disabled = true;

    // Attach the escalated user's email to the note
    const currentEsc = escalations.find(e => e.conversation_id === convId);
    const userEmail = currentEsc?.user_email || 'Not provided';
    const noteWithEmail = text + '\n\n— User: ' + userEmail;

    await dbInsert('agent_replies', {
      conversation_id: convId,
      role: 'agent',
      message: noteWithEmail,
      is_private: true,
      created_at: new Date().toISOString()
    });

    // Refresh private notes in the right panel
    loadPrivateNotes(convId);
    
    // Reset to reply mode
    setComposerMode('reply');
  }

  function refreshMessagesOnly(esc) {
    const msgContainer = document.getElementById('nw-chat-messages');
    if (!msgContainer) return;
    const isAtBottom = msgContainer.scrollHeight - msgContainer.scrollTop <= msgContainer.clientHeight + 50;
    renderMessagesHTML(msgContainer, esc);
    if (isAtBottom) {
      setTimeout(() => { msgContainer.scrollTo({ top: msgContainer.scrollHeight, behavior: 'instant' }); }, 100);
    }
  }

  async function sendAgentReply(convId, inputEl, msgContainer) {
    const text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';
    document.getElementById('nw-agent-send').disabled = true;
    
    const latestEsc = escalations.find(e => e.conversation_id === convId);
    if (!latestEsc) return;

    // Insert into UI immediately
    const div = document.createElement('div');
    div.className = 'flex gap-2 max-w-[85%] self-end mt-4';
    div.innerHTML = `
      <div class="flex flex-col gap-1 items-end w-full">
        <div class="bg-primary-container text-[#ffffff] font-body-sm text-body-sm p-4 rounded-2xl rounded-tr-sm shadow-sm flex flex-col gap-3">
          <p>${escapeHtml(text).replace(/\n/g, '<br>')}</p>
        </div>
        <div class="flex items-center gap-2 text-[10px] text-on-surface-variant font-label-xs">
          <span>Just now</span>
        </div>
      </div>
      <div class="w-6 h-6 rounded-full shrink-0 self-end mb-5 bg-primary-container flex items-center justify-center font-bold text-[10px] text-white">A</div>
    `;
    msgContainer.appendChild(div);
    setTimeout(() => { msgContainer.scrollTo({ top: msgContainer.scrollHeight, behavior: 'smooth' }); }, 50);

    // Save to DB
    await dbInsert('agent_replies', {
      conversation_id: convId, role: 'agent', message: text, is_private: false, created_at: new Date().toISOString()
    });

    let history = [];
    try { history = JSON.parse(latestEsc.chat_history || '[]'); } catch(e) {}
    history.push({ role: 'agent', text: text, timestamp: new Date().toISOString() });
    latestEsc.chat_history = JSON.stringify(history);

    await dbUpdate('escalations', 'conversation_id', convId, { chat_history: latestEsc.chat_history });
  }

  async function resolveConversation(esc) {
    const btnResolve = document.getElementById('nw-btn-resolve');
    if (btnResolve) {
      btnResolve.innerHTML = '<span class="material-symbols-outlined text-[18px]">check</span> Resolved';
      btnResolve.classList.replace('bg-[#22C55E]', 'bg-[#10B981]');
      btnResolve.disabled = true;
    }

    await dbUpdate('escalations', 'conversation_id', esc.conversation_id, { status: 'resolved' });
    
    // Clear selection and switch to Resolved tab so user can see it moved there
    selectedConvId = null;
    mainPanel.classList.add('hidden');
    emptyState.classList.remove('hidden');
    await fetchEscalations();
    setTab('resolved');
  }

  // ─── Search ───
  const searchInput = document.getElementById('nw-search-input');
  if (searchInput) {
    let searchDebounce = null;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        searchQuery = searchInput.value.trim();
        renderSidebar();
      }, 200);
    });
  }

  // ─── Profile Popup ───
  window.openProfilePopup = function() {
    const popup = document.getElementById('profile-popup');
    const backdrop = document.getElementById('profile-backdrop');
    if (popup) popup.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    updateProfileTime();
  };

  window.closeProfilePopup = function() {
    const popup = document.getElementById('profile-popup');
    const backdrop = document.getElementById('profile-backdrop');
    if (popup) popup.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
  };

  function updateProfileTime() {
    const el = document.getElementById('profile-local-time');
    if (!el) return;
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12; h = h ? h : 12;
    el.textContent = h + ':' + m + ' ' + ampm + ' local time';
  }

  function populateProfile(session) {
    if (!session) return;
    const name = session.user?.user_metadata?.full_name || session.user?.email || 'Agent';
    const email = session.user?.email || '';
    const phone = session.user?.phone || 'Not set';
    const avatarUrl = session.user?.user_metadata?.avatar_url || '';

    const elName = document.getElementById('profile-name');
    const elEmail = document.getElementById('profile-email');
    const elPhone = document.getElementById('profile-phone');
    const elAvatarImg = document.getElementById('profile-avatar-img');
    const elAvatarInit = document.getElementById('profile-avatar-initial');

    if (elName) elName.textContent = name;
    if (elEmail) elEmail.textContent = email || 'Not set';
    if (elPhone) elPhone.textContent = phone;
    if (avatarUrl && elAvatarImg) {
      elAvatarImg.src = avatarUrl;
      elAvatarImg.classList.remove('hidden');
      if (elAvatarInit) elAvatarInit.classList.add('hidden');
    } else if (elAvatarInit) {
      elAvatarInit.textContent = getInitials(name);
    }
    updateProfileTime();
  }

  // Wire profile button
  const navProfileBtn = document.getElementById('nav-profile-btn');
  if (navProfileBtn) {
    navProfileBtn.onclick = () => openProfilePopup();
  }

  // ═══════════════════════════════════════
  // Auth Check (uses supabaseClient from auth.js)
  // Auth functions (signIn, register, OTP, signOut) are in auth.js
  // ═══════════════════════════════════════
  async function checkAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    const loginScreen = document.getElementById('login-screen');
    const appScreen = document.getElementById('helpdesk-app');
    
    if (session) {
      if (loginScreen) {
          loginScreen.style.display = 'none';
          loginScreen.classList.remove('flex');
      }
      if (appScreen) {
          appScreen.style.display = 'flex';
      }
      
      const agentName = session.user?.user_metadata?.full_name || session.user?.email || 'Agent';
      const avatarUrl = session.user?.user_metadata?.avatar_url || '';
      
      // Update agent name in right panel
      const elName = document.getElementById('agent-name');
      const elAvatar = document.getElementById('agent-avatar');
      if (elName) elName.textContent = agentName;
      if (elAvatar) elAvatar.src = avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(agentName) + '&background=random';
      
      // Update nav profile (bottom left)
      const navAvatar = document.getElementById('nav-profile-avatar');
      const navInitial = document.getElementById('nav-profile-initial');
      if (avatarUrl && navAvatar) {
        navAvatar.src = avatarUrl;
        navAvatar.classList.remove('hidden');
        if (navInitial) navInitial.classList.add('hidden');
      } else if (navInitial) {
        navInitial.textContent = getInitials(agentName);
      }
      
      // Set agent status to online (using SDK-based helper from auth.js)
      await dbUpsert('agents', { 
        id: session.user.id,
        status: 'online',
        name: agentName,
        email: session.user.email || ''
      });
      
      // Populate profile popup
      currentAgentSession = session;
      populateProfile(session);
      
      // Fetch agents list for dropdown
      fetchAgents();
      
      // Start fetching escalations
      fetchEscalations();
      if (!pollInterval) {
        pollInterval = setInterval(fetchEscalations, 5000);
      }
    } else {
      if (loginScreen) {
          loginScreen.style.display = 'flex';
      }
      if (appScreen) {
          appScreen.style.display = 'none';
      }
    }
  }

  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      checkAuth();
    }
  });

  // Init auth check
  checkAuth();
