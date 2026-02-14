document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');
  const sendBtn = document.getElementById('send-btn');

  if (!chatForm || !userInput || !chatBox) {
    console.error('Core elements not found!');
    return;
  }

  // Bot avatar SVG (reusable)
  const botAvatarHTML = `
    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center mt-0.5">
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
    bubble.className = 'bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] shadow-lg shadow-indigo-500/10';

    const p = document.createElement('p');
    p.className = 'text-white text-sm leading-relaxed';
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
    bubble.className = 'bg-white/10 backdrop-blur-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] border border-white/5';

    const p = document.createElement('p');
    p.className = 'text-slate-200 text-sm leading-relaxed';
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
      <div class="bg-white/10 backdrop-blur-sm rounded-2xl rounded-tl-sm px-4 py-3 border border-white/5">
        <div class="flex items-center gap-1.5">
          <span class="typing-dot w-2 h-2 rounded-full bg-indigo-400 inline-block"></span>
          <span class="typing-dot w-2 h-2 rounded-full bg-indigo-400 inline-block"></span>
          <span class="typing-dot w-2 h-2 rounded-full bg-indigo-400 inline-block"></span>
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
    bubble.className = 'bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2';

    const p = document.createElement('p');
    p.className = 'text-red-400 text-xs font-medium';
    p.textContent = text;

    bubble.appendChild(p);
    wrapper.appendChild(bubble);
    chatBox.appendChild(wrapper);
    scrollToBottom();
  }

  function setLoading(isLoading) {
    sendBtn.disabled = isLoading;
    userInput.disabled = isLoading;
    if (isLoading) {
      sendBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
      sendBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      userInput.focus();
    }
  }

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    // 1. Add user message
    appendUserMessage(message);
    userInput.value = '';

    // 2. Show typing indicator & disable input
    setLoading(true);
    showTypingIndicator();

    try {
      // 3. Send request
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: [{ role: 'user', text: message }]
        })
      });

      // 4. Handle response
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      removeTypingIndicator();

      if (data.result) {
        appendBotMessage(data.result);
      } else {
        appendErrorMessage('Maaf, tidak ada respons yang diterima.');
      }
    } catch (error) {
      console.error('Error:', error);
      removeTypingIndicator();
      appendErrorMessage('Gagal mendapatkan respons dari server.');
    } finally {
      setLoading(false);
    }
  });
});
