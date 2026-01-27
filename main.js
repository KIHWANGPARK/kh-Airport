const socket = io("https://YOUR-SERVER-URL"); 

const titleEl = document.getElementById("title");
const tbody = document.getElementById("tbody");

socket.on("state:update", (state) => {
  titleEl.textContent = state.title || "작업표";

  const rows = state.rows || [];

  if (rows.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td class="muted" colspan="6">표시할 항목이 없습니다.</td>
      </tr>`;
    return;
  }

  tbody.innerHTML = rows.map(r => `
    <tr>
      <td><b>${r.aircraft}</b></td>
      <td>${r.time}</td>
      <td>${r.spot}</td>
      <td>${r.work}</td>
      <td>${r.note || "-"}</td>
      <td>${r.worker}</td>
    </tr>
  `).join("");
});