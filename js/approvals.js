const API_URL = "https://internal-chatbot-backend.onrender.com/approvals";
const UPDATE_URL = "https://internal-chatbot-backend.onrender.com/approvals/update";

async function fetchApprovals() {
  const res = await fetch(API_URL);
  return await res.json();
}

async function renderApprovals() {
  const approvals = await fetchApprovals();
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  approvals.forEach(item => {
    let requestTypeText = item.request_type;

    // 🔥 Add Pause Days formatting
    if (item.request_type === "Add Pause Days") {
      requestTypeText = `${item.request_type} : ${item.pause_days_requested} Days`;
    }

    // 🔥 Transfer Plan formatting
    if (item.request_type === "Transfer Plan") {
      requestTypeText = `${item.request_type} : ${item.requested_plan}`;
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.client_name}</td>
      <td>${item.contact}</td>
      <td>${requestTypeText}</td>
      <td>${item.order_by}</td>
      <td>${item.approval_owner}</td>
      <td>
        <span class="status ${item.status.toLowerCase()}">${item.status}</span>
      </td>
      <td class="notes">${item.reason}</td>
      <td>
        <select onchange="handleAction(${item.id}, this.value)">
          <option value="">Select</option>
          <option value="Approved">Approve</option>
          <option value="Rejected">Reject</option>
        </select>
      </td>
    `;
    tbody.appendChild(row);
  });
}

async function handleAction(id, action) {
  if (!action) return;

  const remark = prompt(
    action === "Approved" ? "Approval remark:" : "Rejection remark:"
  );

  await fetch(UPDATE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status: action, remarks: remark || "" })
  });

  await renderApprovals();
}

document.addEventListener("DOMContentLoaded", renderApprovals);
