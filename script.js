// Generate one session per browser tab
const sessionId = crypto.randomUUID();

// 🔁 Switch automatically based on environment
const BACKEND_URL =
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:8000/chat"
    : "https://internal-chatbot-backend-1.onrender.com/chat";

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
  let data;
  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        session_id: sessionId,
        message: text,
      }),
    });

    data = await response.json();
  } catch (err) {
    data = { reply: "Sorry, unable to connect to the server." };
  }

  // ---- SYSTEM MESSAGE ----
  const systemRow = document.createElement("div");
  systemRow.className = "message-row system";
  systemRow.innerHTML = `
    <div class="avatar ai">AI</div>
    <div class="bubble-group">
      <div class="message system">${data.reply}</div>
      <div class="timestamp">${getTime()}</div>
    </div>
  `;
  chatBody.appendChild(systemRow);
  chatBody.scrollTop = chatBody.scrollHeight;
}
