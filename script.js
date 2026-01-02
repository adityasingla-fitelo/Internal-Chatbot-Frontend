function handleEnter(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}

function getTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const fileInput = document.getElementById("fileInput");
const filePreview = document.getElementById("filePreview");

fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    filePreview.innerText = `Attached: ${fileInput.files[0].name}`;
  }
});

async function sendMessage() {
  const input = document.getElementById("userInput");
  const chatBody = document.getElementById("chatBody");

  const text = input.value.trim();
  const file = fileInput.files[0];

  if (!text && !file) return;

  // Show user message
  const userRow = document.createElement("div");
  userRow.className = "message-row user";

  userRow.innerHTML = `
    <div class="avatar user">You</div>
    <div class="bubble-group">
      <div class="message user">${text || "📎 Screenshot attached"}</div>
      <div class="timestamp">${getTime()}</div>
    </div>
  `;

  chatBody.appendChild(userRow);
  chatBody.scrollTop = chatBody.scrollHeight;

  // Prepare multipart form
  const formData = new FormData();
  if (text) formData.append("message", text);
  if (file) formData.append("screenshot", file);

  // Reset UI
  input.value = "";
  fileInput.value = "";
  filePreview.innerText = "";

  // Call backend
  const response = await fetch(
    "https://internal-chatbot-backend-1.onrender.com/chat",
    {
      method: "POST",
      body: formData
    }
  );

  const data = await response.json();

  // System response
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
