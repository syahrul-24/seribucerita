document.addEventListener('DOMContentLoaded', () => {
  // ========== MOBILE MENU ==========
  const burgerBtn = document.getElementById('burger-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (burgerBtn && mobileMenu) {
    burgerBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
    // Close mobile menu on link click
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

  if (!chatForm || !userInput || !chatBox) {
    console.error('Chat elements not found!');
    return;
  }

  // ========== CONVERSATION HISTORY (sessionStorage) ==========
  const STORAGE_KEY = 'seribucerita_history';
  let conversationHistory = [];

  // Restore from sessionStorage
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      conversationHistory = JSON.parse(saved);
    }
  } catch {
    conversationHistory = [];
  }

  function saveHistory() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(conversationHistory));
    } catch {
      // sessionStorage full — trim oldest messages
      if (conversationHistory.length > 6) {
        conversationHistory = conversationHistory.slice(-6);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(conversationHistory));
      }
    }
  }

  // Bot avatar SVG (reusable)
  const botAvatarHTML = `
    <div class="w-8 h-8 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center mt-0.5">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    </div>
  `;

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

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    appendUserMessage(message);
    userInput.value = '';

    // Add to conversation history
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
        // Add bot response to history
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
