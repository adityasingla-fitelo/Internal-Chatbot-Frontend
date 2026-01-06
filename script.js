const sessionId = crypto.randomUUID();

// BACKEND
const BACKEND_URL = "http://127.0.0.1:8000/chat";
// const BACKEND_URL = "https://internal-chatbot-backend-1.onrender.com/chat";

/* ---------------- UTILS ---------------- */

function handleEnter(e) {
  if (e.key === "Enter") sendMessage();
}

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ---------------- CORE SEND ---------------- */

async function sendMessage(overrideText = null) {
  const input = document.getElementById("userInput");
  const chatBody = document.getElementById("chatBody");

  const text = overrideText ?? input.value.trim();
  if (!text) return;

  // User text bubble (not for file refs)
  if (!overrideText || !overrideText.startsWith("FILE_REF::")) {
    appendUserMessage(text);
  }

  input.value = "";

  let data;
  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        session_id: sessionId,
        message: text,
      }),
    });
    data = await res.json();
  } catch {
    data = { reply: "Server connection failed." };
  }

  appendSystemMessage(data.reply);

  // Calendar hooks
  if (data.stage === "ask_dates") renderDateRangeCalendar();
  if (data.stage === "ask_single_date") renderSingleDateCalendar();
}

/* ---------------- MESSAGE UI ---------------- */

function appendUserMessage(text) {
  const chatBody = document.getElementById("chatBody");

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
  chatBody.scrollTop = chatBody.scrollHeight;
}

function appendSystemMessage(text) {
  const chatBody = document.getElementById("chatBody");

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
  chatBody.scrollTop = chatBody.scrollHeight;
}

/* ---------------- FILE UPLOAD ---------------- */

document.getElementById("fileInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  renderFilePreview(file);

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://127.0.0.1:8000/upload", {
    method: "POST",
    body: formData
  });

  const data = await res.json();

  // 🔥 IMPORTANT: immediately advance workflow
  sendMessage(`FILE_REF::${data.file_path}`);

  // reset picker
  e.target.value = "";
});

/* ---------------- PREVIEW ---------------- */

function renderFilePreview(file) {
  const chatBody = document.getElementById("chatBody");
  const imgURL = URL.createObjectURL(file);

  const row = document.createElement("div");
  row.className = "message-row user";

  row.innerHTML = `
    <div class="avatar user">You</div>
    <div class="bubble-group">
      <div class="message user image-bubble">
        <img src="${imgURL}" class="chat-image"
             onclick="window.open('${imgURL}', '_blank')" />
        <div class="file-name">${file.name}</div>
      </div>
      <div class="timestamp">${getTime()}</div>
    </div>
  `;

  chatBody.appendChild(row);
  chatBody.scrollTop = chatBody.scrollHeight;
}

/* ---------------- CALENDARS ---------------- */

function renderDateRangeCalendar() {
  if (document.getElementById("calendarRow")) return;

  const chatBody = document.getElementById("chatBody");
  const row = document.createElement("div");
  row.id = "calendarRow";
  row.className = "message-row system";

  row.innerHTML = `
    <div class="avatar ai">AI</div>
    <div class="bubble-group">
      <div class="message system">
        <label>Start Date</label><br/>
        <input type="date" id="startDate"/><br/><br/>
        <label>End Date</label><br/>
        <input type="date" id="endDate"/><br/><br/>
        <button onclick="confirmRange()">Confirm Dates</button>
      </div>
    </div>
  `;

  chatBody.appendChild(row);
}

function confirmRange() {
  const s = document.getElementById("startDate").value;
  const e = document.getElementById("endDate").value;
  if (!s || !e) return alert("Select both dates");

  document.getElementById("calendarRow").remove();
  sendMessage(`${s}|${e}`);
}

function renderSingleDateCalendar() {
  if (document.getElementById("calendarRow")) return;

  const chatBody = document.getElementById("chatBody");
  const row = document.createElement("div");
  row.id = "calendarRow";
  row.className = "message-row system";

  row.innerHTML = `
    <div class="avatar ai">AI</div>
    <div class="bubble-group">
      <div class="message system">
        <input type="date" id="singleDate"/>
        <button onclick="confirmSingle()">Confirm</button>
      </div>
    </div>
  `;

  chatBody.appendChild(row);
}

function confirmSingle() {
  const d = document.getElementById("singleDate").value;
  if (!d) return alert("Select date");

  document.getElementById("calendarRow").remove();
  sendMessage(d);
}
