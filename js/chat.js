// =====================================
// BACKEND CONFIGURATION
// =====================================

const BACKEND_BASE_URL = "https://internal-chatbot-backend-1.onrender.com";
//const BACKEND_BASE_URL = "http://127.0.0.1:8000";

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
// USER MESSAGE
// =====================================
function renderUserMessage(text) {
  const row = document.createElement("div");
  row.className = "message-row user";

  row.innerHTML = `
    <div class="avatar user">You</div>
    <div class="bubble-group">
      <div class="message user">${text}</div>
      <div class="timestamp">${getTime()}</div>
    </div>
  `;

  chatBody.appendChild(row);
  scrollToBottom();
}

// =====================================
// BOT MESSAGE
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
// SINGLE DATE CALENDAR (Change Start Date)
// =====================================
function renderSingleDateCalendar() {
  const row = document.createElement("div");
  row.className = "message-row system";

  row.innerHTML = `
    <div class="avatar ai">AI</div>
    <div class="bubble-group calendar-container">
      <input type="date" class="chat-calendar" />
      <button class="calendar-confirm-btn">Confirm</button>
    </div>
  `;

  chatBody.appendChild(row);
  scrollToBottom();

  const input = row.querySelector("input");
  const btn = row.querySelector("button");

  btn.onclick = () => {
    if (!input.value) {
      alert("Please select a date");
      return;
    }

    sendMessage(input.value);
    row.remove();
  };
}

// =====================================
// DATE RANGE CALENDAR (Pause Facility)
// =====================================
function renderDateRangeCalendar() {
  const row = document.createElement("div");
  row.className = "message-row system";

  row.innerHTML = `
    <div class="avatar ai">AI</div>
    <div class="bubble-group calendar-container">
      <label>Start</label>
      <input type="date" class="chat-calendar start" />

      <label>End</label>
      <input type="date" class="chat-calendar end" />

      <button class="calendar-confirm-btn">Confirm</button>
    </div>
  `;

  chatBody.appendChild(row);
  scrollToBottom();

  const start = row.querySelector(".start");
  const end = row.querySelector(".end");
  const btn = row.querySelector("button");

  btn.onclick = () => {
    if (!start.value || !end.value) {
      alert("Please select both dates");
      return;
    }

    sendMessage(`${start.value}|${end.value}`);
    row.remove();
  };
}

// =====================================
// APPROVAL STATUS BUTTON
// =====================================
function renderApprovalStatusButton() {
  const row = document.createElement("div");
  row.className = "message-row system";

  row.innerHTML = `
    <div class="avatar ai">AI</div>
    <div class="bubble-group">
      <button class="approval-btn" onclick="window.open('/approvals.html','_blank')">
        Check Approval Status
      </button>
    </div>
  `;

  chatBody.appendChild(row);
  scrollToBottom();
}

// =====================================
// SEND MESSAGE (🔥 FIXED CORE LOGIC)
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
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        session_id: sessionId,
        message,
      }),
    });

    if (!response.ok) throw new Error();

    const data = await response.json();

    // 🔥 IMPORTANT: UI-ONLY STAGES DO NOT RENDER TEXT
    if (data.stage === "ask_single_date") {
      renderSingleDateCalendar();
      return;
    }

    if (data.stage === "ask_dates") {
      renderDateRangeCalendar();
      return;
    }

    // ✅ NORMAL TEXT FLOW
    renderBotMessage(data.reply);

    if (data.stage === "show_approval_status_button") {
      renderApprovalStatusButton();
    }

  } catch {
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

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(UPLOAD_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error();

    const data = await response.json();
    sendMessage(`FILE_REF::${data.file_path}`);

  } catch {
    renderBotMessage("File upload failed. Please try again.");
  }

  fileInput.value = "";
});
