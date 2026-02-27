const socket = io("https://kh-server.onrender.com/");

const titleEl = document.getElementById("title");
const tbody = document.getElementById("tbody");

// 4명씩 줄바꿈
function formatWorkers4PerLine(workersArr) {
  const cleaned = (workersArr || [])
    .map(s => String(s).trim())
    .filter(Boolean);

  const lines = [];
  for (let i = 0; i < cleaned.length; i += 4) {
    lines.push(cleaned.slice(i, i + 4).join(" "));
  }
  return lines.join("\n");
}

function normalizeWorkers(r) {
  if (Array.isArray(r.workers)) return r.workers;
  if (typeof r.worker === "string") {
    return r.worker.split(/\s+/).map(s => s.trim()).filter(Boolean);
  }
  return [];
}

// ✅ dep/arr 시간 꺼내기 (신버전 depTime/arrTime 우선, 없으면 time에서 파싱)
function getDepArrTime(r) {
  const dep = String(r?.depTime ?? "").trim();
  const arr = String(r?.arrTime ?? "").trim();
  if (dep && arr) return { dep, arr };

  const t = String(r?.time ?? "").trim();
  const m = t.match(/^(\d{2}:\d{2})\s*~\s*(\d{2}:\d{2})$/);
  if (m) return { dep: m[1], arr: m[2] };

  return { dep: escapeHtml(t), arr: "" }; // 혹시 단일 문자열이면 dep에만 표시
}

socket.on("state:update", (state) => {
  titleEl.textContent = state?.title || "작업표";

  const rows = state?.rows || [];

  if (rows.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td class="muted" colspan="5">표시할 항목이 없습니다.</td>
      </tr>`;
    return;
  }

  tbody.innerHTML = rows.map(r => {
    const workersArr = normalizeWorkers(r);
    const workersText = formatWorkers4PerLine(workersArr);

    const { dep, arr } = getDepArrTime(r);
    const timeText = arr ? `${dep} / ${arr}` : `${dep}`;
    // const timeHtml = arr ? `${escapeHtml(dep)}<br>${escapeHtml(arr)}` : `${escapeHtml(dep)}`;

    return `
      <tr>
        <td><b>${escapeHtml(r.aircraft ?? "")}</b></td>
        
        <td>${escapeHtml(timeText)}</td>
        <td>${escapeHtml(r.spot ?? "")}</td>
        <td class="workCell">${escapeHtml(r.work ?? "")}</td>
        <td class="workerCell">${escapeHtml(workersText)}</td>
      </tr>
    `;
  }).join("");
});

// XSS 방지(간단)
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}