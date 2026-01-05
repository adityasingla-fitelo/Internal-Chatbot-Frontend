const sessionId = crypto.randomUUID();

function handleEnter(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}

function getTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

async function sendMessage() {
  const input = document.getElementById("userInput");
  const chatBody = document.getElementById("chatBody");

  const text = input.value.trim();
  if (!text) return;

  // ---- USER MESSAGE ----
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

  // ---- BACKEND CALL ----
  const response = await fetch(
    "https://internal-chatbot-backend-1.onrender.com/chat",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({ message: text })
    }
  );

//     const response = await fetch("http://127.0.0.1:8000/chat", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/x-www-form-urlencoded"
//   },
//   body: new URLSearchParams({
//   session_id: sessionId,
//   message: text})
// });


  const data = await response.json();

  // ---- SYSTEM MESSAGE ----
  const systemRow = document.createElement("div");
  systemRow.className = "message-row system";

  systemRow.innerHTML = `
    <div class="avatar ai">AI</div>
    <div class="bubble-group">
      <div class="message system">
        ${data.reply}
      </div>
      <div class="timestamp">${getTime()}</div>
    </div>
  `;

  chatBody.appendChild(systemRow);
  chatBody.scrollTop = chatBody.scrollHeight;
}
