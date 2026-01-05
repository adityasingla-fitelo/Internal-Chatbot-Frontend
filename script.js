// Generate one session per browser tab
const sessionId = crypto.randomUUID();

const BACKEND_URL = "https://internal-chatbot-backend-1.onrender.com/chat";
//const BACKEND_URL = "http://127.0.0.1:8000/chat";

function handleEnter(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}

function getTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

async function sendMessage(overrideText = null) {
  const input = document.getElementById("userInput");
  const chatBody = document.getElementById("chatBody");

  const text = overrideText ?? input.value.trim();
  if (!text) return;

  // ---- USER MESSAGE (skip if override) ----
  if (!overrideText) {
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
  }

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

  // ---- RENDER CALENDAR INSIDE CHAT ----
  if (data.stage === "ask_dates") {
    renderCalendar(chatBody);
  }
}

// Helper to send calendar dates without showing user bubble
function sendMessageWithOverride(text) {
  sendMessage(text);
}

function renderCalendar(chatBody) {
  // Prevent duplicate calendars
  if (document.getElementById("calendarRow")) return;

  const calendarRow = document.createElement("div");
  calendarRow.className = "message-row system";
  calendarRow.id = "calendarRow";

  calendarRow.innerHTML = `
    <div class="avatar ai">AI</div>
    <div class="bubble-group">
      <div class="message system">
        <div class="calendar-container">
          <label>
            Start Date:
            <input type="date" id="startDate" />
          </label>

          <label style="margin-top:8px;">
            End Date:
            <input type="date" id="endDate" />
          </label>

          <div style="margin-top:12px;">
            <button class="calendar-confirm-btn" id="confirmDates">
              Confirm Dates
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  chatBody.appendChild(calendarRow);
  chatBody.scrollTop = chatBody.scrollHeight;

  document.getElementById("confirmDates").onclick = () => {
    const start = document.getElementById("startDate").value;
    const end = document.getElementById("endDate").value;

    if (!start || !end) {
      alert("Please select both start and end date");
      return;
    }

    calendarRow.remove();
    sendMessageWithOverride(`${start}|${end}`);
  };
}
