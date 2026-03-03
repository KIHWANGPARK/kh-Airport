const socket = io("https://kh-server.onrender.com/");

const titleEl = document.getElementById("title");
const tbody = document.getElementById("tbody");
const itemTbody = document.getElementById("itemTbody");

const WEEKDAY_KO = ["일", "월", "화", "수", "목", "금", "토"];

function makeKoreanTitle(now = new Date()) {
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const day = WEEKDAY_KO[now.getDay()];
  return `${y}년 ${m}월 ${d}일(${day}) 항공기 주요작업사항`;
}

function updateTitleNow() {
  if (!titleEl) return;
  titleEl.textContent = makeKoreanTitle(new Date());
}
updateTitleNow();
setInterval(updateTitleNow, 30 * 1000);

// 4명씩 줄바꿈
function formatWorkers4PerLine(workersArr) {
  const cleaned = (workersArr || []).map(s => String(s).trim()).filter(Boolean);
  const lines = [];
  for (let i = 0; i < cleaned.length; i += 4) lines.push(cleaned.slice(i, i + 4).join(" "));
  return lines.join("\n");
}

function normalizeWorkers(r) {
  if (Array.isArray(r.workers)) return r.workers;
  if (typeof r.worker === "string") return r.worker.split(/\s+/).map(s => s.trim()).filter(Boolean);
  return [];
}

function getDepArrTime(r) {
  const dep = String(r?.depTime ?? "").trim();
  const arr = String(r?.arrTime ?? "").trim();
  if (dep && arr) return { dep, arr };

  const t = String(r?.time ?? "").trim();
  const m = t.match(/^((?:GRD)|(?:\d{2}:\d{2}))\s*~\s*((?:GRD)|(?:\d{2}:\d{2}))$/);
  if (m) return { dep: m[1], arr: m[2] };

  return { dep: t, arr: "" };
}

// ✅ ITEM 여러 줄 렌더
function renderItemRows(itemRows) {
  if (!itemTbody) return;

  const list = Array.isArray(itemRows) ? itemRows : [];

  if (list.length === 0) {
    itemTbody.innerHTML = `<tr><td class="muted" colspan="8">-</td></tr>`;
    return;
  }

  itemTbody.innerHTML = list.map(row => `
    <tr>
      <td>${escapeHtml(row.A ?? "")}</td>
      <td>${escapeHtml(row.B ?? "")}</td>
      <td>${escapeHtml(row.C ?? "")}</td>
      <td>${escapeHtml(row.D ?? "")}</td>
      <td>${escapeHtml(row.E ?? "")}</td>
      <td>${escapeHtml(row.F ?? "")}</td>
      <td>${escapeHtml(row.G ?? "")}</td>
      <td>${escapeHtml(row.H ?? "")}</td>
    </tr>
  `).join("");
}

socket.on("state:update", (state) => {
  updateTitleNow();

  const rows = state?.rows || [];

  if (rows.length === 0) {
    tbody.innerHTML = `
      <tr><td class="muted" colspan="5">표시할 항목이 없습니다.</td></tr>`;
  } else {
    tbody.innerHTML = rows.map(r => {
      const workersText = formatWorkers4PerLine(normalizeWorkers(r));
      const { dep, arr } = getDepArrTime(r);
      const timeText = arr ? `${dep} / ${arr}` : `${dep}`;

      return `
        <tr>
          <td><b>${escapeHtml(r.aircraft ?? "")}</b></td>
          <td>${escapeHtml(timeText)}</td>
          <td>${escapeHtml(r.spot ?? "")}</td>
          <td class="workCell">${formatWorkWithDivider(r.work)}</td>
          <td class="workerCell">${escapeHtml(workersText)}</td>
        </tr>
      `;
    }).join("");
  }

  // ✅ 여기서 itemRows 렌더
  renderItemRows(state?.itemRows);
});

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatWorkWithDivider(text) {
  const lines = String(text ?? "").split("\n").map(s => s.trim()).filter(Boolean);
  if (!lines.length) return "";
  return lines.map(line => `<div class="workLine">${escapeHtml(line)}</div>`).join("");
}