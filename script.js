function handleEnter(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}

function getTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function sendMessage() {
  const input = document.getElementById("userInput");
  const chatBody = document.getElementById("chatBody");
  const text = input.value.trim();
  if (!text) return;

  // User message
  const userRow = document.createElement("div");
  userRow.className = "message-row user";

  userRow.innerHTML = `
    <div class="avatar user">You</div>
    <div class="bubble-group">
      <div class="message user">${text}</div>
      <div class="timestamp">${getTime()}</div>
    </div>
  `;

  chatBody.appendChild(userRow);
  input.value = "";
  chatBody.scrollTop = chatBody.scrollHeight;

  // Backend call (Render)
  const response = await fetch(
    "https://internal-chatbot-backend-1.onrender.com/chat",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    }
  );

  const data = await response.json();

  // AI message
  const aiRow = document.createElement("div");
  aiRow.className = "message-row system";

  aiRow.innerHTML = `
    <div class="avatar ai">AI</div>
    <div class="bubble-group">
      <div class="message system">${data.reply}</div>
      <div class="timestamp">${getTime()}</div>
    </div>
  `;

  chatBody.appendChild(aiRow);
  chatBody.scrollTop = chatBody.scrollHeight;
}
