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
  return lines.join("\n"); // Display에서 \n을 줄바꿈으로 보이게 처리
}

// 혹시 worker가 문자열로 올 수도 있으니 방어적으로 처리
function normalizeWorkers(r) {
  if (Array.isArray(r.workers)) return r.workers; // ✅ 신버전(권장)
  if (typeof r.worker === "string") {
    return r.worker.split(/\s+/).map(s => s.trim()).filter(Boolean);
  }
  return [];
}

socket.on("state:update", (state) => {
  titleEl.textContent = state?.title || "작업표";

  const rows = state?.rows || [];

  if (rows.length === 0) {
    // ✅ 비고 컬럼 제거 후 5컬럼 기준(colspan=5)
    tbody.innerHTML = `
      <tr>
        <td class="muted" colspan="5">표시할 항목이 없습니다.</td>
      </tr>`;
    return;
  }

  tbody.innerHTML = rows.map(r => {
    const workersArr = normalizeWorkers(r);
    const workersText = formatWorkers4PerLine(workersArr);

    // ✅ 작업사항/작업자 모두 줄바꿈 표시되게 pre-wrap 사용
    return `
      <tr>
        <td><b>${escapeHtml(r.aircraft ?? "")}</b></td>
        <td>${escapeHtml(r.time ?? "")}</td>
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

/*
✅ 같이 적용하면 좋은 Display style.css 수정(참고)
-----------------------------------------------
th:nth-child(4), td.workCell { width: 260px; }  // 작업사항 줄이기
th:nth-child(5), td.workerCell { width: 340px; } // 작업자 늘리기

td.workCell, td.workerCell { white-space: pre-wrap; }
*/