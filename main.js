const socket = io("https://kh-server.onrender.com/"); 

const titleEl = document.getElementById("title");
const tbody = document.getElementById("tbody");

// ✅ HTML 이스케이프(작업사항/비고/작업자에 < > 등이 들어가도 안전)
function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ✅ 작업자: 공백으로 연결된 이름들을 4명씩 끊어서 줄바꿈 처리
function formatWorkers(workerStr) {
  const names = String(workerStr || "").trim().split(/\s+/).filter(Boolean);
  if (names.length === 0) return "-";

  const lines = [];
  for (let i = 0; i < names.length; i += 4) {
    lines.push(names.slice(i, i + 4).join(" "));
  }
  return lines.join("\n"); // 4명마다 줄바꿈
}

socket.on("state:update", (state) => {
  titleEl.textContent = state?.title || "작업표";

  const rows = state?.rows || [];

  if (rows.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td class="muted" colspan="6">표시할 항목이 없습니다.</td>
      </tr>`;
    return;
  }

  tbody.innerHTML = rows.map(r => `
    <tr>
      <td><b>${escapeHtml(r.aircraft)}</b></td>
      <td>${escapeHtml(r.time)}</td>
      <td>${escapeHtml(r.spot)}</td>

      <!-- ✅ 작업사항: CSS에서 pre-wrap 적용하면 줄바꿈 유지됨 -->
      <td class="workCell">${escapeHtml(r.work)}</td>

      <td>${escapeHtml(r.note || "-")}</td>

      <!-- ✅ 작업자: 4명씩 줄바꿈 -->
      <td class="workerCell">${escapeHtml(formatWorkers(r.worker))}</td>
    </tr>
  `).join("");
});