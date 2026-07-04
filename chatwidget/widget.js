(function() {
  const fontLink = document.createElement('link');
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap';
  fontLink.rel = 'stylesheet';
  document.head.appendChild(fontLink);

  // Load DOMPurify for XSS protection
  const purifyScript = document.createElement('script');
  purifyScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.1.6/purify.min.js';
  document.head.appendChild(purifyScript);

  const style = document.createElement('style');
  style.innerHTML = `
    .noa-chat-launcher {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      width: 60px; height: 60px; border-radius: 50%;
      background: linear-gradient(135deg, #2D4030, #3A5A3E);
      box-shadow: 0 4px 20px rgba(45,64,48,0.4);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; border: none;
      transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s ease;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .noa-chat-launcher:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(45,64,48,0.55); }
    .noa-chat-launcher svg { transition: opacity 0.25s, transform 0.3s; }
    .noa-chat-launcher .noa-icon-hidden { opacity: 0; position: absolute; transform: rotate(90deg); }

    .noa-chat-widget {
      position: fixed; bottom: 96px; right: 24px; z-index: 9998;
      width: 380px; max-width: calc(100vw - 48px);
      height: 560px; max-height: calc(100vh - 120px);
      background: #fff; border-radius: 16px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.12);
      display: flex; flex-direction: column; overflow: hidden;
      opacity: 0; transform: translateY(20px) scale(0.95);
      pointer-events: none;
      transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.4,0,0.2,1);
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .noa-chat-widget.noa-open {
      opacity: 1; transform: translateY(0) scale(1); pointer-events: all;
    }

    .noa-chat-header {
      background: linear-gradient(135deg, #2D4030, #1E2D20);
      padding: 16px 18px; display: flex; align-items: center; gap: 12px;
      flex-shrink: 0;
    }
    .noa-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: #E2D7C5; color: #2D4030;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 11px; text-transform: uppercase;
    }
    .noa-header-info { flex: 1; }
    .noa-header-info h4 { color: #fff; font-size: 14px; font-weight: 600; margin: 0; }
    .noa-header-status { color: rgba(255,255,255,0.7); font-size: 11px; display: flex; align-items: center; gap: 5px; }
    .noa-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #2ECC71; display: inline-block; }
    .noa-close-btn {
      background: none; border: none; color: rgba(255,255,255,0.7);
      cursor: pointer; font-size: 18px; padding: 4px;
      transition: color 0.2s;
    }
    .noa-close-btn:hover { color: #fff; }

    .noa-chat-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 8px;
      background: #F7F5F0;
    }
    .noa-chat-messages::-webkit-scrollbar { width: 4px; }
    .noa-chat-messages::-webkit-scrollbar-thumb { background: #d0d0d0; border-radius: 4px; }

    .noa-msg-user {
      align-self: flex-end; background: #2D4030; color: #fff;
      border-radius: 16px 16px 4px 16px; padding: 10px 14px;
      max-width: 82%; font-size: 13.5px; line-height: 1.55;
    }
    .noa-msg-bot {
      align-self: flex-start; background: #fff; color: #1a1a1a;
      border-radius: 16px 16px 16px 4px; padding: 10px 14px;
      max-width: 82%; font-size: 13.5px; line-height: 1.55;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.04);
    }
    .noa-msg-attachment { margin-top: 8px; border-radius: 8px; overflow: hidden; max-width: 200px; }
    .noa-msg-attachment img { width: 100%; border-radius: 8px; cursor: pointer; transition: opacity 0.2s; }

    .noa-typing-dots { display: flex; gap: 4px; padding: 4px 0; }
    .noa-typing-dots span {
      width: 7px; height: 7px; border-radius: 50%; background: #ccc;
      animation: noaBlink 1.4s infinite both;
    }
    .noa-typing-dots span:nth-child(2) { animation-delay: .2s; }
    .noa-typing-dots span:nth-child(3) { animation-delay: .4s; }
    @keyframes noaBlink { 0%,80%,100%{opacity:.3} 40%{opacity:1} }

    @keyframes noaMsgSlideIn {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .noa-msg-animate { animation: noaMsgSlideIn 0.35s cubic-bezier(0.25,0.46,0.45,0.94) both; }

    .noa-chat-input-area {
      padding: 12px; background: #fff; border-top: 1px solid #eee; flex-shrink: 0;
    }
    .noa-input-wrapper {
      display: flex; align-items: flex-end; gap: 8px;
      background: #F7F5F0; border-radius: 14px; padding: 8px 12px;
      border: 1.5px solid transparent; transition: border-color 0.2s;
    }
    .noa-input-wrapper:focus-within { border-color: #2D4030; }
    .noa-file-btn, .noa-send-btn {
      background: none; border: none; cursor: pointer; padding: 4px;
      display: flex; align-items: center; justify-content: center;
      transition: opacity 0.2s;
    }
    .noa-file-btn { color: #999; }
    .noa-file-btn:hover { color: #2D4030; }
    .noa-send-btn { color: #2D4030; }
    .noa-send-btn:disabled { color: #ccc; cursor: default; }
    #noa-input {
      flex: 1; border: none; background: transparent; resize: none;
      font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13.5px; line-height: 1.4;
      max-height: 80px; outline: none; color: #333;
    }
    #noa-input::placeholder { color: #aaa; }
    .noa-img-preview {
      margin: 0 12px 8px; padding: 8px; background: #F7F5F0; border-radius: 10px;
      display: flex; align-items: center; gap: 8px;
    }
    .noa-img-preview img { width: 48px; height: 48px; object-fit: cover; border-radius: 6px; }
    .noa-img-preview-name { font-size: 12px; color: #666; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .noa-img-preview-remove {
      background: none; border: none; color: #D36B4D; cursor: pointer; font-size: 16px; padding: 2px;
    }

    /* Quick Replies */
    .noa-qr-container { align-self: flex-start; max-width: 92%; }
    .noa-qr-grid { display: flex; flex-wrap: wrap; gap: 6px; }
    .noa-qr-chip {
      display: flex; align-items: center; gap: 6px;
      background: #fff; border: 1px solid #E5E2DB; color: #2D4030;
      padding: 8px 14px; border-radius: 20px; font-size: 12px; font-weight: 500;
      cursor: pointer; transition: all 0.2s ease; white-space: nowrap;
    }
    .noa-qr-chip:hover { background: #2D4030; color: #fff; border-color: #2D4030; }
    .noa-qr-icon { font-size: 14px; }
    .noa-qr-fade-out { animation: fadeOut 0.3s ease forwards; }
    @keyframes fadeOut { to { opacity: 0; transform: translateY(-8px); } }

    /* Product Tiles */
    .noa-product-tiles-wrapper {
      display: flex; flex-direction: column;
      align-self: flex-start; max-width: 280px; margin-top: 8px;
    }
    .noa-product-tile {
      display: flex; flex-direction: column;
      background: #fff; border-radius: 12px; overflow: hidden;
      border: 1px solid #E5E2DB; box-shadow: 0 4px 14px rgba(0,0,0,0.06);
      text-decoration: none; color: inherit; cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      margin-bottom: 12px; animation: noaMsgSlideIn 0.3s ease forwards;
    }
    .noa-product-tile:last-child { margin-bottom: 0; }
    .noa-product-tile:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 10px 24px rgba(45,64,48,0.15); border-color: #2D4030;
    }
    .noa-ptile-img-wrap { position: relative; width: 100%; height: 140px; overflow: hidden; background: #F7F5F0; }
    .noa-ptile-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
    .noa-product-tile:hover .noa-ptile-img { transform: scale(1.08); }
    .noa-ptile-overlay {
      position: absolute; inset: 0; background: rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.3s ease;
    }
    .noa-product-tile:hover .noa-ptile-overlay { opacity: 1; }
    .noa-ptile-view-btn {
      background: #2D4030; color: #fff; padding: 6px 16px; border-radius: 20px;
      font-size: 11px; font-weight: 600; transform: translateY(8px); transition: transform 0.3s ease;
    }
    .noa-product-tile:hover .noa-ptile-view-btn { transform: translateY(0); }
    .noa-ptile-tag {
      position: absolute; top: 8px; left: 8px; background: #D36B4D; color: #fff;
      font-size: 9px; font-weight: 700; padding: 3px 6px; border-radius: 4px; z-index: 2;
    }
    .noa-ptile-info { padding: 12px 14px 4px; display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
    .noa-ptile-name { font-weight: 600; font-size: 13px; color: #333; line-height: 1.3; }
    .noa-ptile-price { font-weight: 700; font-size: 14px; color: #D36B4D; }
    .noa-ptile-link-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 14px 12px; }
    .noa-ptile-shop-link { font-size: 11px; font-weight: 700; color: #2D4030; }
    .noa-ptile-arrow { font-size: 14px; color: #2D4030; transition: transform 0.25s ease; }
    .noa-product-tile:hover .noa-ptile-arrow { transform: translateX(4px); }

    .noa-proactive-bubble {
      position: fixed; bottom: 96px; right: 24px; z-index: 9998;
      background: #fff; padding: 14px 18px; border-radius: 16px; border-bottom-right-radius: 4px;
      box-shadow: 0 8px 28px rgba(45,64,48,0.15);
      font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 500; color: #333; line-height: 1.4;
      max-width: 260px; cursor: pointer;
      opacity: 0; transform: translateY(12px) scale(0.95); pointer-events: none;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .noa-proactive-bubble:hover { transform: translateY(-2px) scale(1); box-shadow: 0 12px 32px rgba(45,64,48,0.2); }
    .noa-proactive-bubble.visible { opacity: 1; transform: translateY(0) scale(1); pointer-events: all; }

    @media (max-width: 480px) {
      .noa-chat-widget { width: calc(100vw - 16px); right: 8px; bottom: 80px; height: 70vh; max-height: 75vh; border-radius: 16px; }
      .noa-chat-launcher { bottom: 16px; right: 16px; }
      .noa-proactive-bubble { bottom: 88px; right: 16px; max-width: calc(100vw - 48px); }
    }
  `;
  document.head.appendChild(style);

  const widgetHtml = `
    <button class="noa-chat-launcher" id="noa-launcher" aria-label="Chat with Arata">
      <svg id="noa-icon-open" width="26" height="26" viewBox="0 0 28 32" fill="white">
        <path d="M28 16c0 8.837-6.268 16-14 16-2.49 0-4.84-.645-6.876-1.778L0 32l2.462-6.6C.894 22.906 0 19.558 0 16 0 7.163 6.268 0 14 0s14 7.163 14 16z"/>
      </svg>
      <svg id="noa-icon-close" class="noa-icon-hidden" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </button>

    <div class="noa-proactive-bubble" id="noa-proactive-bubble">
      Welcome to Arata! 👋 What are you looking to buy today?
    </div>

    <div class="noa-chat-widget" id="noa-widget">
      <div class="noa-chat-header">
        <div class="noa-avatar">NW</div>
        <div class="noa-header-info">
          <h4>Arata Support</h4>
          <span class="noa-header-status"><span class="noa-status-dot"></span> Online</span>
        </div>
        <button class="noa-close-btn" id="noa-close-btn" aria-label="Close chat">✕</button>
      </div>

      <div class="noa-chat-messages" id="noa-messages"></div>

      <div class="noa-chat-input-area">
        <div class="noa-input-wrapper">
          <button class="noa-file-btn" id="noa-file-btn" aria-label="Attach file">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
          </button>
          <textarea id="noa-input" rows="1" placeholder="Ask about our products..."></textarea>
          <button class="noa-send-btn" id="noa-send-btn" disabled aria-label="Send">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
        <input type="file" id="noa-file-input" accept="image/*" style="display:none;">
      </div>
    </div>
  `;
  
  const container = document.createElement('div');
  container.innerHTML = widgetHtml;
  document.body.appendChild(container);

  // IMPORTANT: Since this is an embeddable widget, it MUST use an absolute URL, 
  // otherwise it will try to call /api/chat on the client's website!
  const WEBHOOK_URL = 'https://93960379.arata-demo.pages.dev/api/chat'; 
  // NOTE: Once chat.nodewave.co is fully active, you can change the above to:
  // const WEBHOOK_URL = 'https://chat.nodewave.co/api/chat';

  // ── Supabase Config ──
  const SUPABASE_URL = 'https://kzjvawxuubhhvodhmppt.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6anZhd3h1dWJoaHZvZGhtcHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzNzkyNjgsImV4cCI6MjA5Nzk1NTI2OH0.wtJmml3Yi1BY-imqG4T7-NPe2DQALhbAFTcJJxvcaiM';

  // ── Proactive Welcome Config ──
  const PROACTIVE_MSG_DELAY = 5000;
  let proactiveTimer = null;

  // Helper: Supabase REST API calls
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
        console.error('[Noa-Supabase] Insert error:', res.status, errText);
        return null;
      }
      return await res.json();
    } catch (err) {
      console.error('[Noa-Supabase] Insert failed:', err);
      return null;
    }
  }

  async function supabaseSelect(table, query) {
    try {
      const res = await fetch(SUPABASE_URL + '/rest/v1/' + table + '?' + query, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY
        }
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.error('[Noa-Supabase] Select failed:', err);
      return [];
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
        const errText = await res.text();
        console.error('[Noa-Supabase] Update error:', res.status, errText);
        return null;
      }
      return await res.json();
    } catch (err) {
      console.error('[Noa-Supabase] Update failed:', err);
      return null;
    }
  }

  const launcher = document.getElementById('noa-launcher');
  const widget   = document.getElementById('noa-widget');
  const iconOpen = document.getElementById('noa-icon-open');
  const iconClose= document.getElementById('noa-icon-close');
  const closeBtn = document.getElementById('noa-close-btn');
  const msgBody  = document.getElementById('noa-messages');
  const input    = document.getElementById('noa-input');
  const sendBtn  = document.getElementById('noa-send-btn');
  const fileInput= document.getElementById('noa-file-input');
  const fileBtn  = document.getElementById('noa-file-btn');

  let isOpen = false;
  let pendingFile = null;
  let conversationId = 'conv_' + crypto.randomUUID();
  let chatHistory = [];
  let isEscalated = false;
  let isSessionCreated = false;
  let agentPollInterval = null;
  let hasActiveSession = false; // Tracks if a session is already open

  const ARATA_IMAGES = [
    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1615397323281-a589dc3309ce?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1590156546946-cb5d8ce611ea?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=400&q=80'
  ];
  let imgIndex = 0;
  function getNextImage() {
    const img = ARATA_IMAGES[imgIndex];
    imgIndex = (imgIndex + 1) % ARATA_IMAGES.length;
    return img;
  }

  function toggleChat() {
    isOpen = !isOpen;
    widget.classList.toggle('noa-open', isOpen);
    
    // Hide bubble if it's showing
    const bubble = document.getElementById('noa-proactive-bubble');
    if (bubble && bubble.classList.contains('visible')) {
      bubble.classList.remove('visible');
    }

    if (isOpen) {
      if (!hasActiveSession) {
        startFreshSession();
        hasActiveSession = true;
      }
      
      iconOpen.style.opacity = '0';
      iconOpen.style.transform = 'rotate(90deg)';
      iconClose.style.opacity = '1';
      iconClose.style.transform = 'rotate(0deg)';
      input.focus();
    } else {
      iconOpen.style.opacity = '1';
      iconOpen.style.transform = 'rotate(0deg)';
      iconClose.style.opacity = '0';
      iconClose.style.transform = 'rotate(-90deg)';
    }
  }

  const bubbleEl = document.getElementById('noa-proactive-bubble');
  if (bubbleEl) {
    bubbleEl.addEventListener('click', () => {
      toggleChat();
    });
  }

  launcher.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);

  function startFreshSession(customWelcome = null) {
    if (proactiveTimer) { clearTimeout(proactiveTimer); proactiveTimer = null; }
    
    conversationId = 'conv_' + crypto.randomUUID();
    chatHistory = [];
    isEscalated = false;
    isSessionCreated = false;
    lastAgentMsgCount = 0;
    if (agentPollInterval) { clearInterval(agentPollInterval); agentPollInterval = null; }
    msgBody.innerHTML = '';

    const welcomeText = customWelcome || "Hey, welcome to Arata! 🌱 I'm your AI assistant. How can I help you today?";
    addBubble(welcomeText, 'bot', null, false);
    
    const qrWrap = document.createElement('div');
    qrWrap.className = 'noa-qr-container noa-msg-animate';
    qrWrap.innerHTML = `
      <div class="noa-qr-grid">
        <div class="noa-qr-chip">🌿 What products do you have?</div>
        <div class="noa-qr-chip">💰 What's the pricing?</div>
        <div class="noa-qr-chip">🚚 Shipping & Delivery</div>
        <div class="noa-qr-chip">🔄 Returns & Refunds</div>
        <div class="noa-qr-chip">🧴 Hair Care Tips</div>
        <div class="noa-qr-chip">✨ Skin Care Routine</div>
      </div>
    `;
    msgBody.appendChild(qrWrap);
    scrollToBottom();

    const chips = qrWrap.querySelectorAll('.noa-qr-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        qrWrap.classList.add('noa-qr-fade-out');
        setTimeout(() => qrWrap.remove(), 300);
        input.value = chip.textContent.replace(/[^\x00-\x7F]/g, "").trim();
        sendMessage();
      });
    });
  }

  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 80) + 'px';
    sendBtn.disabled = !input.value.trim() && !pendingFile;
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) sendMessage();
    }
  });

  fileBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      pendingFile = file;
      let preview = document.querySelector('.noa-img-preview');
      if (!preview) {
        preview = document.createElement('div');
        preview.className = 'noa-img-preview';
        document.querySelector('.noa-chat-input-area').insertBefore(preview, document.querySelector('.noa-input-wrapper'));
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.innerHTML = `
          <img src="${e.target.result}" alt="Preview">
          <span class="noa-img-preview-name">${file.name}</span>
          <button class="noa-img-preview-remove" aria-label="Remove">✕</button>
        `;
        preview.querySelector('.noa-img-preview-remove').addEventListener('click', () => {
          pendingFile = null;
          fileInput.value = '';
          preview.remove();
          sendBtn.disabled = !input.value.trim();
        });
        sendBtn.disabled = false;
      };
      reader.readAsDataURL(file);
    }
  });

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function buildPayload(text, attachments) {
    const now = Math.floor(Date.now() / 1000);
    const msgId = 'msg_' + Date.now();
    return {
      type: 'notification_event',
      app_id: 'app_nodewave',
      data: {
        type: 'notification_event_data',
        item: {
          type: 'conversation',
          id: conversationId,
          created_at: now,
          updated_at: now,
          source: {
            type: 'conversation',
            id: 'src_' + msgId,
            delivered_as: 'customer_initiated',
            subject: '',
            body: '<p>' + (text || '') + '</p>',
            author: {
              type: 'user',
              id: 'web_visitor_' + conversationId,
              name: 'Website Visitor',
              email: 'visitor@nodewave.co'
            },
            attachments: (attachments || []).map(a => ({
              name: a.name || 'file',
              url: a.url,
              content_type: a.content_type || 'image/jpeg',
              filesize: a.filesize || 0
            }))
          },
          custom_attributes: {
            'Brand': 'Arata',
            'Language': 'English',
            'Source': 'website_widget'
          },
          conversation_parts: {
            type: 'conversation_part.list',
            conversation_parts: [{
              type: 'conversation_part',
              id: 'part_' + msgId,
              part_type: 'comment',
              body: '<p>' + (text || '') + '</p>',
              created_at: now,
              updated_at: now,
              notified_at: now,
              assigned_to: null,
              author: {
                type: 'user',
                id: 'web_visitor_' + conversationId,
                name: 'Website Visitor',
                email: 'visitor@nodewave.co'
              },
              attachments: (attachments || []).map(a => ({
                name: a.name || 'file',
                url: a.url,
                content_type: a.content_type || 'image/jpeg'
              }))
            }],
            total_count: 1
          }
        }
      },
      topic: 'conversation.user.replied',
      id: 'notif_' + Date.now(),
      created_at: now
    };
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text && !pendingFile) return;

    let attachments = [];
    if (pendingFile) {
      const dataUrl = await fileToDataUrl(pendingFile);
      attachments.push({
        name: pendingFile.name,
        url: dataUrl,
        content_type: pendingFile.type,
        filesize: pendingFile.size
      });
      pendingFile = null;
      const preview = document.querySelector('.noa-img-preview');
      if (preview) preview.remove();
    }

    chatHistory.push({ role: 'user', text: text, timestamp: new Date().toISOString() });
    addBubble(text, 'user', attachments);
    
    input.value = '';
    input.style.height = 'auto';
    sendBtn.disabled = true;
    
    showTyping();

    try {
      const payload = buildPayload(text, attachments);
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }

      const rawText = await response.text();

      let data;
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        removeTyping();
        addBubble(rawText || 'Received empty response', 'bot');
        return;
      }

      removeTyping();

      let reply = '';
      let wasEscalated = false;
      if (typeof data === 'string') reply = data;
      else {
        if (data.reply) reply = data.reply;
        else if (data.response) reply = data.response;
        else if (data.output) reply = data.output;
        else if (data.text) reply = data.text;
        else if (data.message) reply = data.message;
        else if (data.data && data.data.reply) reply = data.data.reply;
        else if (data.data && data.data.response) reply = data.data.response;
        else if (data.data && data.data.output) reply = data.data.output;
        else if (data.data && data.data.text) reply = data.data.text;
        else reply = JSON.stringify(data);

        // Detect escalation flag robustly (handles boolean true or string "true")
        const isTrue = (val) => val === true || String(val).toLowerCase() === 'true';
        wasEscalated = isTrue(data.escalated) || (data.data && isTrue(data.data.escalated));
      }

      chatHistory.push({ role: 'bot', text: reply, timestamp: new Date().toISOString() });
      addBubble(reply, 'bot');

      if (wasEscalated && !isEscalated) {
        isEscalated = true;
        showEscalationForm();
      } else if (wasEscalated) {
        isEscalated = true;
      }
      await syncConversationToSupabase(text);

    } catch (err) {
      removeTyping();
      addBubble("Sorry, I'm having trouble connecting to the server. Please try again later.", 'bot');
    }
  }
  sendBtn.addEventListener('click', sendMessage);

  function addBubble(text, role, attachments, doScroll = true) {
    const wrap = document.createElement('div');
    wrap.className = role === 'bot' ? 'noa-msg-bot noa-msg-animate' : 'noa-msg-user noa-msg-animate';

    // Extract markdown images from message text (agent sends: ![alt](url))
    const mdImages = [];
    let cleanText = (text || '').replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
      mdImages.push({ alt, url });
      return ''; // Remove the markdown image from the text
    }).trim();

    if (cleanText && role === 'bot') {
      const productUrls = extractProductUrls(cleanText);
      const prices = extractPrices(cleanText);
      const productNames = extractProductNames(cleanText);
      const displayText = cleanBotResponse(cleanText);
      
      wrap.innerHTML = formatBotHtml(displayText);
      msgBody.appendChild(wrap);
      
      if (productUrls.length > 0) {
        renderProductTiles(productUrls, prices);
      } else if (productNames.length > 0) {
        renderProductTilesFromNames(productNames, prices);
      }
    } else if (cleanText) {
      wrap.innerHTML = escapeHtml(cleanText).replace(/\n/g, '<br>');
      msgBody.appendChild(wrap);
    } else {
      msgBody.appendChild(wrap);
    }

    // Render extracted markdown images
    mdImages.forEach(imgData => {
      const attWrap = document.createElement('div');
      attWrap.className = 'noa-msg-attachment';
      const img = document.createElement('img');
      img.src = imgData.url;
      img.loading = 'lazy';
      img.alt = imgData.alt || 'Attachment';
      img.style.maxWidth = '100%';
      img.style.borderRadius = '12px';
      img.style.marginTop = '8px';
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => window.open(imgData.url, '_blank'));
      attWrap.appendChild(img);
      wrap.appendChild(attWrap);
    });

    if (attachments && attachments.length) {
      attachments.forEach(att => {
        if (att.content_type && att.content_type.startsWith('image/')) {
          const attWrap = document.createElement('div');
          attWrap.className = 'noa-msg-attachment';
          const img = document.createElement('img');
          img.src = att.url;
          img.loading = 'lazy';
          img.alt = att.name || 'Attachment';
          img.addEventListener('click', () => window.open(att.url, '_blank'));
          attWrap.appendChild(img);
          wrap.appendChild(attWrap);
        }
      });
    }

    if (doScroll) scrollToBottom();
  }

  function extractProductNames(text) {
    if (!text || typeof text !== 'string') return [];
    const names = [];
    let m;
    const numberedRegex = /\d+[.\)]\s*(.+?)(?:\s*[-–—]\s*\$?\d|$|\n)/gm;
    while ((m = numberedRegex.exec(text)) !== null) {
      const name = m[1].replace(/\*+/g, '').trim();
      if (name.length > 3 && name.length < 80) names.push(name);
    }
    if (names.length === 0) {
      const boldRegex = /\*\*([^*]{4,60})\*\*/g;
      while ((m = boldRegex.exec(text)) !== null) {
        const candidate = m[1].trim();
        if (!isGenericPhrase(candidate)) names.push(candidate);
      }
    }
    if (names.length === 0) {
      const dashRegex = /^[-•]\s+(.{4,60})$/gm;
      while ((m = dashRegex.exec(text)) !== null) {
        const item = m[1].replace(/\*+/g, '').trim();
        if (!isGenericPhrase(item)) names.push(item);
      }
    }
    const seen = new Set();
    return names.filter(n => { const k = n.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 3);
  }

  function isGenericPhrase(str) {
    const lc = str.toLowerCase();
    const generics = ['here are', 'check out', 'take a look', 'i recommend',
      'let me know', 'feel free', 'happy to help', 'sure', 'of course',
      'no problem', 'you can', 'please', 'thank', 'welcome'];
    return generics.some(g => lc.includes(g));
  }

  function extractProductUrls(text) {
    if (!text || typeof text !== 'string') return [];
    const urls = [];
    let m;
    const mdRegex = /\[([^\]]+)\]\((https?:\/\/[^\s\)]+|www\.[^\s\)]+)\)/gi;
    while ((m = mdRegex.exec(text)) !== null) {
      let url = m[2];
      if (url.startsWith('www.')) url = 'https://' + url;
      urls.push({ fullUrl: url, slug: m[1] });
    }
    const hrefRegex = /href=["'](https?:\/\/[^\s"']+|www\.[^\s"']+)["']/gi;
    while ((m = hrefRegex.exec(text)) !== null) {
      let url = m[1];
      if (url.startsWith('www.')) url = 'https://' + url;
      if (!urls.some(u => u.fullUrl.toLowerCase() === url.toLowerCase())) {
        urls.push({ fullUrl: url, slug: 'Product' });
      }
    }
    const rawRegex = /(https?:\/\/[^\s<)"']+|www\.[^\s<)"']+)/gi;
    while ((m = rawRegex.exec(text)) !== null) {
      let url = m[1].replace(/[.,;:\)\]]$/, '');
      if (url.startsWith('www.')) url = 'https://' + url;
      if (!urls.some(u => u.fullUrl.toLowerCase() === url.toLowerCase())) {
        const parts = url.split('/').filter(Boolean);
        let slug = parts[parts.length - 1] || 'Item';
        slug = slug.replace(/[^a-zA-Z0-9-]/g, '');
        urls.push({ fullUrl: url, slug });
      }
    }
    const seen = new Set();
    return urls.filter(u => { const k = u.fullUrl.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 3);
  }

  function extractPrices(text) {
    if (!text || typeof text !== 'string') return [];
    const prices = [];
    const priceRegex = /\$(\d+(?:\.\d{2})?)/g;
    let m;
    while ((m = priceRegex.exec(text)) !== null) prices.push(m[1]);
    return prices;
  }

  function cleanBotResponse(text) {
    if (!text || typeof text !== 'string') return '';
    let clean = text.replace(/\*+/g, '');
    clean = clean.replace(/\[([^\]]+)\]\((https?:\/\/[^\s\)]+|www\.[^\s\)]+)\)/gi, '$1');
    clean = clean.replace(/<a[^>]*>([^<]+)<\/a>/gi, '$1');
    clean = clean.replace(/(https?:\/\/[^\s<)"']+|www\.[^\s<)"']+)/gi, '');
    clean = clean.replace(/\[API RESPONSE[^\]]*\]/gi, '');
    clean = clean.replace(/\(\s*\)/g, '');
    clean = clean.replace(/\n{3,}/g, '\n\n');
    return clean.trim();
  }

  function formatBotHtml(text) {
    if (!text) return '';
    const raw = escapeHtml(text).replace(/\n/g, '<br>');
    // Sanitize with DOMPurify if available (loaded asynchronously)
    if (typeof DOMPurify !== 'undefined') {
      return DOMPurify.sanitize(raw, { ALLOWED_TAGS: ['br', 'b', 'i', 'em', 'strong', 'a', 'p', 'span'], ALLOWED_ATTR: ['href', 'target', 'rel'] });
    }
    return raw;
  }

  function renderProductTiles(productUrls, prices) {
    const wrapper = document.createElement('div');
    wrapper.className = 'noa-product-tiles-wrapper noa-msg-animate';

    productUrls.forEach((product, i) => {
      const prettyName = product.slug.length > 3 ? product.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Premium Product';
      const price = prices[i] || '';
      const imgSrc = getNextImage();

      const tile = document.createElement('a');
      tile.href = product.fullUrl;
      tile.target = '_blank';
      tile.rel = 'noopener';
      tile.className = 'noa-product-tile';
      tile.style.animationDelay = (i * 0.15) + 's';
      tile.innerHTML = buildTileHTML(prettyName, price, imgSrc);
      wrapper.appendChild(tile);
    });

    msgBody.appendChild(wrapper);
    scrollToBottom();
  }

  function renderProductTilesFromNames(productNames, prices) {
    const wrapper = document.createElement('div');
    wrapper.className = 'noa-product-tiles-wrapper noa-msg-animate';

    productNames.forEach((name, i) => {
      const price = prices[i] || '';
      const imgSrc = getNextImage();
      const searchUrl = 'https://www.google.com/search?q=' + encodeURIComponent('Arata ' + name + ' buy');

      const tile = document.createElement('a');
      tile.href = searchUrl;
      tile.target = '_blank';
      tile.rel = 'noopener';
      tile.className = 'noa-product-tile';
      tile.style.animationDelay = (i * 0.15) + 's';
      tile.innerHTML = buildTileHTML(name, price, imgSrc);
      wrapper.appendChild(tile);
    });

    msgBody.appendChild(wrapper);
    scrollToBottom();
  }

  function buildTileHTML(name, price, imgSrc) {
    const safeName = escapeHtml(name);
    const priceHtml = price ? `<div class="noa-ptile-price">$${price}</div>` : '';
    const tagHtml = price ? '<div class="noa-ptile-tag">HOT 🔥</div>' : '<div class="noa-ptile-tag">NEW ✨</div>';

    return `
      <div class="noa-ptile-img-wrap">
        <img src="${imgSrc}" alt="${safeName}" class="noa-ptile-img" onerror="this.style.display='none'" />
        <div class="noa-ptile-overlay">
          <span class="noa-ptile-view-btn">View Item</span>
        </div>
        ${tagHtml}
      </div>
      <div class="noa-ptile-info">
        <div class="noa-ptile-name">${safeName}</div>
        ${priceHtml}
      </div>
      <div class="noa-ptile-link-row">
        <span class="noa-ptile-shop-link">Shop Now</span>
        <span class="noa-ptile-arrow">&rarr;</span>
      </div>
    `;
  }

  function showTyping() {
    removeTyping();
    const el = document.createElement('div');
    el.className = 'noa-msg-bot noa-typing-msg noa-msg-animate';
    el.innerHTML = '<div class="noa-typing-dots"><span></span><span></span><span></span></div>';
    msgBody.appendChild(el);
    scrollToBottom();
  }

  function removeTyping() {
    document.querySelectorAll('.noa-typing-msg').forEach(el => el.remove());
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      msgBody.scrollTo({ top: msgBody.scrollHeight, behavior: 'smooth' });
    });
  }

  
  function showEscalationForm() {
    const wrap = document.createElement('div');
    wrap.className = 'noa-msg-bot noa-msg-animate noa-escalation-form';
    wrap.style.cssText = 'background: #ffffff; border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px; margin-top: 12px;';
    
    wrap.innerHTML = `
      <p style="font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 8px;">Please provide your details so we can reach out:</p>
      <input type="text" id="esc-name" placeholder="Your Name" style="width: 100%; padding: 10px; margin-bottom: 8px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px;">
      <input type="email" id="esc-email" placeholder="Your Email" style="width: 100%; padding: 10px; margin-bottom: 12px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px;">
      <button id="esc-submit" style="width: 100%; padding: 10px; background: #000; color: #fff; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;">Submit Details</button>
    `;
    
    msgBody.appendChild(wrap);
    scrollToBottom();
    
    const btn = wrap.querySelector('#esc-submit');
    const nameInput = wrap.querySelector('#esc-name');
    const emailInput = wrap.querySelector('#esc-email');
    
    btn.onclick = async () => {
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      if (!name || !email) {
        alert('Please provide both name and email.');
        return;
      }
      btn.innerText = 'Submitting...';
      btn.disabled = true;
      
      await supabaseUpdate('escalations', 'conversation_id=eq.' + conversationId, {
        user_name: name,
        user_email: email,
        status: 'escalated',
        escalated_at: new Date().toISOString()
      });
      
      wrap.innerHTML = '<p style="font-size: 14px; font-weight: 500; color: #10B981; margin: 0; text-align: center;">Details submitted. Our team will contact you shortly.</p>';
      scrollToBottom();
    };
  }

  // ── Supabase Conversation Sync ──
  async function syncConversationToSupabase(lastUserMsg) {
    const rowData = {
      status: isEscalated ? 'escalated' : 'active',
      chat_history: JSON.stringify(chatHistory),
      last_user_message: lastUserMsg || ''
    };
    if (isEscalated) {
      rowData.escalated_at = new Date().toISOString();
    }

    if (!isSessionCreated) {
      console.log('[Noa] Creating new conversation in Supabase...');
      rowData.conversation_id = conversationId;
      rowData.user_name = 'Website Visitor';
      rowData.user_email = 'visitor@nodewave.co';
      rowData.created_at = new Date().toISOString();
      rowData.brand = 'Arata';
      
      const result = await supabaseInsert('escalations', rowData);
      if (result) {
        isSessionCreated = true;
        startAgentReplyPolling(); // Start polling for agent replies immediately
      }
    } else {
      await supabaseUpdate('escalations', 'conversation_id=eq.' + conversationId, rowData);
    }
  }

  // ── Poll for Agent Replies (from Dashboard) ──
  let lastAgentMsgCount = 0;

  function startAgentReplyPolling() {
    if (agentPollInterval) return; // Already polling
    
    agentPollInterval = setInterval(async () => {
      try {
        const query = 'conversation_id=eq.' + conversationId + '&role=eq.agent&order=created_at.asc';
        const msgs = await supabaseSelect('agent_replies', query);
        
        if (msgs.length > lastAgentMsgCount) {
          // New agent messages arrived
          for (let i = lastAgentMsgCount; i < msgs.length; i++) {
            const agentMsg = msgs[i];
            
            // Skip private notes!
            if (agentMsg.is_private) continue;
            
            chatHistory.push({ role: 'agent', text: agentMsg.message, timestamp: agentMsg.created_at });
            addBubble(agentMsg.message, 'bot');
          }
          lastAgentMsgCount = msgs.length;
        }
      } catch (err) {
        console.error('[Noa] Agent poll error:', err);
      }
    }, 5000); // Poll every 5 seconds (Supabase REST, no n8n executions)
  }

  // ── Initialize Proactive Floating Bubble ──
  if (!sessionStorage.getItem('noa_proactive_shown')) {
    proactiveTimer = setTimeout(() => {
      if (!hasActiveSession && !isOpen) {
        sessionStorage.setItem('noa_proactive_shown', 'true');
        
        const bubble = document.getElementById('noa-proactive-bubble');
        if (bubble) {
          bubble.classList.add('visible');
        }
      }
    }, PROACTIVE_MSG_DELAY);
  }

})();
