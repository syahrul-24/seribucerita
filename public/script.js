document.addEventListener('DOMContentLoaded', () => {
  // ========== MOBILE MENU ==========
  const burgerBtn = document.getElementById('burger-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (burgerBtn && mobileMenu) {
    burgerBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // ========== CHATBOT ==========
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');
  const sendBtn = document.getElementById('send-btn');
  const charCounter = document.getElementById('char-counter');

  if (!chatForm || !userInput || !chatBox) return;

  // ========== CONSTANTS ==========
  const MAX_CHARS = 2000;

  // ========== STORAGE KEYS ==========
  const HISTORY_KEY = 'seribucerita_history';
  const SAVE_PREF_KEY = 'seribucerita_save_pref';

  // ========== STATE ==========
  let conversationHistory = [];
  let saveEnabled = loadSavePreference();

  // ========== SETTINGS UI ==========
  const settingsBtn = document.getElementById('chat-settings-btn');
  const settingsMenu = document.getElementById('chat-settings-menu');
  const saveToggle = document.getElementById('save-history-toggle');
  const newChatBtn = document.getElementById('new-chat-btn');

  if (settingsBtn && settingsMenu) {
    settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      settingsMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!settingsMenu.contains(e.target) && e.target !== settingsBtn) {
        settingsMenu.classList.add('hidden');
      }
    });
  }

  if (saveToggle) {
    saveToggle.checked = saveEnabled;
    saveToggle.addEventListener('change', () => {
      saveEnabled = saveToggle.checked;
      localStorage.setItem(SAVE_PREF_KEY, saveEnabled ? 'true' : 'false');

      if (!saveEnabled) {
        localStorage.removeItem(HISTORY_KEY);
      } else {
        saveHistory();
      }
    });
  }

  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => {
      conversationHistory = [];
      localStorage.removeItem(HISTORY_KEY);
      chatBox.innerHTML = '';
      chatBox.appendChild(createWelcomeMessage());
      if (settingsMenu) settingsMenu.classList.add('hidden');
    });
  }

  // ========== CHARACTER COUNTER ==========
  if (userInput && charCounter) {
    userInput.addEventListener('input', () => {
      const len = userInput.value.length;
      charCounter.textContent = `${len}/${MAX_CHARS}`;
      charCounter.classList.toggle('text-red-400', len > MAX_CHARS);
      charCounter.classList.toggle('text-muted', len <= MAX_CHARS);
      if (sendBtn) sendBtn.disabled = len > MAX_CHARS || len === 0;
    });
  }

  // ========== TEXTAREA: Enter to submit, Shift+Enter for newline ==========
  if (userInput) {
    userInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) chatForm.dispatchEvent(new Event('submit'));
      }
    });
  }

  // ========== PERSISTENCE HELPERS ==========
  function loadSavePreference() {
    const pref = localStorage.getItem(SAVE_PREF_KEY);
    return pref !== 'false';
  }

  function saveHistory() {
    if (!saveEnabled) return;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(conversationHistory));
    } catch {
      if (conversationHistory.length > 10) {
        conversationHistory = conversationHistory.slice(-10);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(conversationHistory));
      }
    }
  }

  function loadHistory() {
    if (!saveEnabled) return [];
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  // ========== TIME HELPER ==========
  function getTimeString() {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }

  // ========== UI HELPERS ==========
  const botAvatarHTML = `
    <div class="w-8 h-8 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center mt-0.5">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    </div>
  `;

  function createWelcomeMessage() {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex items-start gap-3 chat-message';
    wrapper.innerHTML = `
      ${botAvatarHTML}
      <div class="bg-card border border-primary/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] shadow-sm">
        <p class="text-ink text-sm leading-relaxed">Halo! Saya <strong class="text-secondary">SeribuCerita</strong>, teman cerita AI kamu. Ceritakan apa saja yang kamu rasakan — saya siap mendengarkan. 💙</p>
        <p class="text-xs text-muted mt-1.5 text-right">${getTimeString()}</p>
      </div>
    `;
    return wrapper;
  }

  function scrollToBottom() {
    chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
  }

  function appendUserMessage(text) {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex justify-end chat-message';

    const bubble = document.createElement('div');
    bubble.className = 'bg-primary rounded-2xl rounded-tr-sm px-4 py-3 max-w-[78%] shadow-sm';

    const p = document.createElement('p');
    p.className = 'text-ink text-sm leading-relaxed whitespace-pre-wrap';
    p.textContent = text;

    const time = document.createElement('p');
    time.className = 'text-xs text-ink/50 mt-1.5 text-right';
    time.textContent = getTimeString();

    bubble.appendChild(p);
    bubble.appendChild(time);
    wrapper.appendChild(bubble);
    chatBox.appendChild(wrapper);
    scrollToBottom();
  }

  function appendBotMessage(text) {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex items-start gap-3 chat-message';

    wrapper.innerHTML = botAvatarHTML;

    const bubble = document.createElement('div');
    bubble.className = 'bg-card border border-primary/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[78%] shadow-sm';

    const content = document.createElement('div');
    content.className = 'text-ink text-sm leading-relaxed prose prose-sm max-w-none';

    if (typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
      content.innerHTML = DOMPurify.sanitize(marked.parse(text));
    } else {
      content.textContent = text;
    }

    const time = document.createElement('p');
    time.className = 'text-xs text-muted mt-1.5 text-right';
    time.textContent = getTimeString();

    bubble.appendChild(content);
    bubble.appendChild(time);
    wrapper.appendChild(bubble);
    chatBox.appendChild(wrapper);
    scrollToBottom();
  }

  function showTypingIndicator() {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex items-start gap-3';
    wrapper.id = 'typing-indicator';

    wrapper.innerHTML = `
      ${botAvatarHTML}
      <div class="bg-card border border-primary/10 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div class="flex items-center gap-1.5">
          <span class="typing-dot w-2 h-2 rounded-full bg-secondary inline-block"></span>
          <span class="typing-dot w-2 h-2 rounded-full bg-secondary inline-block"></span>
          <span class="typing-dot w-2 h-2 rounded-full bg-secondary inline-block"></span>
        </div>
      </div>
    `;

    chatBox.appendChild(wrapper);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
  }

  function appendErrorMessage(text) {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex justify-center';

    const bubble = document.createElement('div');
    bubble.className = 'bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 max-w-[90%] flex items-start gap-2';
    bubble.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      <p class="text-red-600 text-xs leading-relaxed">${text}</p>
    `;

    wrapper.appendChild(bubble);
    chatBox.appendChild(wrapper);
    scrollToBottom();
  }

  function setLoading(isLoading) {
    if (sendBtn) sendBtn.disabled = isLoading;
    userInput.disabled = isLoading;
    if (isLoading) {
      if (sendBtn) sendBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
      if (sendBtn) sendBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      userInput.focus();
      // Update btn state based on current input
      const len = userInput.value.length;
      if (sendBtn) sendBtn.disabled = len > MAX_CHARS || len === 0;
    }
  }

  // ========== RESTORE PREVIOUS CHAT ==========
  function createPrivacyNotice() {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex justify-center';
    wrapper.id = 'privacy-notice';
    wrapper.innerHTML = `
      <div class="bg-accent/10 border border-accent/20 rounded-xl px-4 py-2.5 max-w-[90%] text-center">
        <p class="text-xs text-muted leading-relaxed">
          🔒 <strong class="text-ink">Privasimu aman.</strong> Percakapanmu hanya tersimpan di perangkatmu
          dan tidak pernah kami simpan. Kamu bisa berbagi dengan tenang 💙
        </p>
      </div>
    `;
    return wrapper;
  }

  function restoreChatHistory() {
    const saved = loadHistory();
    if (saved.length === 0) return;

    conversationHistory = saved;

    chatBox.innerHTML = '';
    chatBox.appendChild(createPrivacyNotice());
    chatBox.appendChild(createWelcomeMessage());

    const resumeNotice = document.createElement('div');
    resumeNotice.className = 'flex justify-center';
    resumeNotice.innerHTML = `
      <div class="bg-secondary/10 border border-secondary/20 rounded-full px-4 py-1.5">
        <p class="text-xs text-secondary font-medium">✨ Melanjutkan percakapan sebelumnya</p>
      </div>
    `;
    chatBox.appendChild(resumeNotice);

    for (const msg of saved) {
      if (msg.role === 'user') {
        appendUserMessage(msg.text);
      } else {
        appendBotMessage(msg.text);
      }
    }
  }

  restoreChatHistory();

  // ========== SEND MESSAGE ==========
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    // Frontend validation
    if (message.length > MAX_CHARS) {
      appendErrorMessage(`Pesanmu terlalu panjang (${message.length} karakter). Maksimal ${MAX_CHARS} karakter.`);
      return;
    }

    appendUserMessage(message);
    userInput.value = '';

    // Reset textarea height & counter
    userInput.style.height = 'auto';
    if (charCounter) {
      charCounter.textContent = `0/${MAX_CHARS}`;
      charCounter.classList.remove('text-red-400');
      charCounter.classList.add('text-muted');
    }

    conversationHistory.push({ role: 'user', text: message });

    setLoading(true);
    showTypingIndicator();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: conversationHistory
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      removeTypingIndicator();

      if (data.result) {
        appendBotMessage(data.result);
        conversationHistory.push({ role: 'model', text: data.result });
        saveHistory();
      } else {
        appendErrorMessage('Maaf, tidak ada respons yang diterima.');
      }
    } catch (error) {
      console.error('Error:', error);
      removeTypingIndicator();
      appendErrorMessage(error.message || 'Gagal mendapatkan respons dari server.');
    } finally {
      setLoading(false);
    }
  });
});
