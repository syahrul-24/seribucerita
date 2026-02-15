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

  if (!chatForm || !userInput || !chatBox) return;

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
    // Toggle dropdown
    settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      settingsMenu.classList.toggle('hidden');
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!settingsMenu.contains(e.target) && e.target !== settingsBtn) {
        settingsMenu.classList.add('hidden');
      }
    });
  }

  // Save toggle
  if (saveToggle) {
    saveToggle.checked = saveEnabled;
    saveToggle.addEventListener('change', () => {
      saveEnabled = saveToggle.checked;
      localStorage.setItem(SAVE_PREF_KEY, saveEnabled ? 'true' : 'false');

      if (!saveEnabled) {
        // User turned off — remove saved history
        localStorage.removeItem(HISTORY_KEY);
      } else {
        // User turned on — save current history
        saveHistory();
      }
    });
  }

  // New chat button
  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => {
      conversationHistory = [];
      localStorage.removeItem(HISTORY_KEY);

      // Clear chat UI (keep welcome message)
      chatBox.innerHTML = '';
      chatBox.appendChild(createWelcomeMessage());

      // Close dropdown
      if (settingsMenu) settingsMenu.classList.add('hidden');
    });
  }

  // ========== PERSISTENCE HELPERS ==========
  function loadSavePreference() {
    const pref = localStorage.getItem(SAVE_PREF_KEY);
    // Default ON (true) if not set
    return pref !== 'false';
  }

  function saveHistory() {
    if (!saveEnabled) return;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(conversationHistory));
    } catch {
      // Storage full — trim to last 10 messages
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
    wrapper.className = 'flex items-start gap-3';
    wrapper.innerHTML = `
      ${botAvatarHTML}
      <div class="bg-card border border-primary/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] shadow-sm">
        <p class="text-ink text-sm leading-relaxed">Halo! Saya <strong class="text-secondary">SeribuCerita</strong>, teman curhat AI kamu. Ceritakan apa saja yang kamu rasakan — saya siap mendengarkan tanpa menghakimi. 💙</p>
      </div>
    `;
    return wrapper;
  }

  function scrollToBottom() {
    chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
  }

  function appendUserMessage(text) {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex justify-end';

    const bubble = document.createElement('div');
    bubble.className = 'bg-primary rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] shadow-sm';

    const p = document.createElement('p');
    p.className = 'text-ink text-sm leading-relaxed';
    p.textContent = text;

    bubble.appendChild(p);
    wrapper.appendChild(bubble);
    chatBox.appendChild(wrapper);
    scrollToBottom();
  }

  function appendBotMessage(text) {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex items-start gap-3';

    wrapper.innerHTML = botAvatarHTML;

    const bubble = document.createElement('div');
    bubble.className = 'bg-card border border-primary/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] shadow-sm';

    const p = document.createElement('p');
    p.className = 'text-ink text-sm leading-relaxed';
    p.textContent = text;

    bubble.appendChild(p);
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
    bubble.className = 'bg-peach/20 border border-peach/30 rounded-xl px-4 py-2';

    const p = document.createElement('p');
    p.className = 'text-ink text-xs font-medium';
    p.textContent = text;

    bubble.appendChild(p);
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
    }
  }

  // ========== RESTORE PREVIOUS CHAT ==========
  function restoreChatHistory() {
    const saved = loadHistory();
    if (saved.length === 0) return;

    conversationHistory = saved;

    // Remove default welcome message and render history
    chatBox.innerHTML = '';
    chatBox.appendChild(createWelcomeMessage());

    // Show a friendly "restored" indicator
    const resumeNotice = document.createElement('div');
    resumeNotice.className = 'flex justify-center';
    resumeNotice.innerHTML = `
      <div class="bg-secondary/10 border border-secondary/20 rounded-full px-4 py-1.5">
        <p class="text-xs text-secondary font-medium">✨ Melanjutkan percakapan sebelumnya</p>
      </div>
    `;
    chatBox.appendChild(resumeNotice);

    // Re-render all messages
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

    appendUserMessage(message);
    userInput.value = '';

    // Add to history
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
