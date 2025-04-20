const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const clearBtn = document.getElementById('clearChat');

function loadChat() {
  const saved = localStorage.getItem('chatHistory');
  if (saved) {
    chatBox.innerHTML = saved;
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}
loadChat();

function saveChat() {
  localStorage.setItem('chatHistory', chatBox.innerHTML);
}

function addMessage(message, sender) {
  const div = document.createElement('div');
  div.className = `message ${sender}`;
  const icon = sender === 'user' ? 'person-fill' : 'robot';
  div.innerHTML = `<i class="bi bi-${icon}"></i> ${message}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
  saveChat();
}

clearBtn.addEventListener('click', () => {
  chatBox.innerHTML = '';
  localStorage.removeItem('chatHistory');
});

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, 'user');
  userInput.value = '';

  const loading = document.createElement('div');
  loading.className = 'message bot';
  loading.innerHTML = `<i class="bi bi-robot"></i> Thinking...`;
  chatBox.appendChild(loading);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer UMevRq5TXIszuaXVrExanZDrQ3sJm05yg5lazVeW'
      },
      body: JSON.stringify({
        model: "command",
        prompt: message,
        max_tokens: 100,
        temperature: 0.9,
        k: 0,
        p: 0.75,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop_sequences: []
      })
    });

    const data = await response.json();
    loading.remove();
    if (data.generations && data.generations.length > 0) {
      addMessage(data.generations[0].text.trim(), 'bot');
    } else {
      addMessage("❌ No reply from AI", 'bot');
    }
  } catch (err) {
    loading.remove();
    addMessage("⚠️ Error: " + err.message, 'bot');
  }
}

function startVoice() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.start();
  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    sendMessage();
  };
  recognition.onerror = function (event) {
    addMessage("🎙️ Voice error: " + event.error, 'bot');
  };
}
