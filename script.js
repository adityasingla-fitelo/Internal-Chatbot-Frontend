// =====================================
// BACKEND CONFIGURATION
// =====================================

// ✅ PRODUCTION (Render) — UPDATE THIS URL IF RENDER CHANGES
const BACKEND_BASE_URL = "https://internal-chatbot-backend-1.onrender.com";

// ✅ LOCAL TESTING (uncomment when needed)
// const BACKEND_BASE_URL = "http://127.0.0.1:8000";

const CHAT_URL = `${BACKEND_BASE_URL}/chat`;
const UPLOAD_URL = `${BACKEND_BASE_URL}/upload`;

// =====================================
// SESSION (one per browser tab)
// =====================================
const sessionId = crypto.randomUUID();

// =====================================
// DOM REFERENCES
// =====================================
const chatBody = document.getElementById("chatBody");
const userInput = document.getElementById("userInput");
const fileInput = document.getElementById("fileInput");

// =====================================
// UTILITIES
// =====================================
function scrollToBottom() {
  chatBody.scrollTop = chatBody.scrollHeight;
}

function getTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// =====================================
// USER MESSAGE (RIGHT SIDE – FIXED)
// =====================================
function renderUserMessage(text) {
  const row = document.createElement("div");
  row.className = "message-row user";

  row.innerHTML = `
    <div class="bubble-group right">
      <div class="message user">${text}</div>
      <div class="timestamp">${getTime()}</div>
    </div>
    <div class="avatar you">You</div>
  `;

  chatBody.appendChild(row);
  scrollToBottom();
}

// =====================================
// BOT MESSAGE (LEFT SIDE)
// =====================================
function renderBotMessage(text) {
  const row = document.createElement("div");
  row.className = "message-row system";

  row.innerHTML = `
    <div class="avatar ai">AI</div>
    <div class="bubble-group">
      <div class="message system">${text}</div>
      <div class="timestamp">${getTime()}</div>
    </div>
  `;

  chatBody.appendChild(row);
  scrollToBottom();
}

// =====================================
// IMAGE MESSAGE (WHATSAPP STYLE)
// =====================================
function renderImageMessage(file) {
  const previewUrl = URL.createObjectURL(file);

  const row = document.createElement("div");
  row.className = "message-row user";

  row.innerHTML = `
    <div class="bubble-group right image-bubble">
      <img
        src="${previewUrl}"
        class="chat-image"
        onclick="window.open('${previewUrl}', '_blank')"
      />
      <div class="file-name">${file.name}</div>
      <div class="timestamp">${getTime()}</div>
    </div>
    <div class="avatar you">You</div>
  `;

  chatBody.appendChild(row);
  scrollToBottom();
}

// =====================================
// SEND TEXT MESSAGE
// =====================================
async function sendMessage(overrideMessage = null) {
  const message = overrideMessage ?? userInput.value.trim();
  if (!message) return;

  if (!overrideMessage) {
    renderUserMessage(message);
    userInput.value = "";
  }

  try {
    const response = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        session_id: sessionId,
        message: message,
      }),
    });

    if (!response.ok) throw new Error("Server error");

    const data = await response.json();
    renderBotMessage(data.reply);

  } catch (err) {
    renderBotMessage("Unable to connect to the server. Please try again.");
  }
}

// =====================================
// ENTER KEY HANDLER
// =====================================
function handleEnter(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}

// =====================================
// FILE UPLOAD HANDLER
// =====================================
fileInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Show preview immediately
  renderImageMessage(file);

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(UPLOAD_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Upload failed");

    const data = await response.json();

    // Advance backend workflow
    sendMessage(`FILE_REF::${data.file_path}`);

  } catch (err) {
    renderBotMessage("File upload failed. Please try again.");
  }

  fileInput.value = "";
});
