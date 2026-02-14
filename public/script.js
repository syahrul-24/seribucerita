document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');

  if (!chatForm || !userInput || !chatBox) {
    console.error('Core elements not found!');
    return;
  }

  function appendMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    if (sender) {
      sender.split(' ').forEach(cls => messageDiv.classList.add(cls));
    }
    messageDiv.innerText = text; // Use innerText for safety
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageDiv;
  }

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    // 1. Add user message
    appendMessage(message, 'user-message');
    userInput.value = '';

    // 2. Show thinking message
    const thinkingDiv = appendMessage('Thinking...', 'bot-message thinking');

    try {
      // 3. Send request
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversation: [{ role: 'user', text: message }]
        })
      });

      // 4. Handle response
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      // Remove thinking message
      thinkingDiv.remove();

      if (data.result) {
        appendMessage(data.result, 'bot-message');
      } else {
        appendMessage('Sorry, no response received.', 'error-message');
      }
    } catch (error) {
      console.error('Error:', error);
      thinkingDiv.remove();
      appendMessage('Failed to get response from server.', 'error-message');
    }
  });
});
