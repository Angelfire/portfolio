const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const symbols = [
  "|",
  "&",
  "^",
  "~",
  "<<",
  ">>",
  ">>>",
  "|=",
  "&=",
  "^=",
  "<<=",
  ">>=",
  ">>>=",
  "<=",
  ">=",
  "<",
  ">",
  "!=",
  "==",
  "??=",
  "||=",
  "&&=",
  "#",
  "::",
  "@",
  "!",
  "??",
  ";",
  ",",
  "{}",
  "[]",
  "()",
  "=>",
  "&&",
  "||",
  "===",
  "!==",
  "++",
  "--",
  "+=",
  "-=",
  "*=",
  "/=",
  "%=",
  "**",
  "...",
  "?:",
  "??",
  "?.",
  "`${}`",
];
let symbolGrid = [];
let lastTime = 0;
const fps = 30;
const fpsInterval = 1000 / fps;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  generateSymbolGrid();
}

function generateSymbolGrid() {
  const lineHeight = 20;
  const symbolWidth = 30;
  symbolGrid = [];

  for (let y = 0; y < canvas.height; y += lineHeight) {
    const row = [];
    for (let x = 0; x < canvas.width; x += symbolWidth) {
      row.push({
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        x,
        y,
        color: "#d0d0d0",
      });
    }
    symbolGrid.push(row);
  }
}

function drawBackground() {
  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "12px monospace";

  symbolGrid.forEach((row) => {
    row.forEach((symbol) => {
      ctx.fillStyle = symbol.color;
      ctx.fillText(symbol.symbol, symbol.x, symbol.y);
    });
  });
}

function handleMouseMove(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const hoverRadius = 30;

  symbolGrid.forEach((row) => {
    row.forEach((symbol) => {
      if (
        Math.abs(symbol.x - x) < hoverRadius &&
        Math.abs(symbol.y - y) < hoverRadius
      ) {
        symbol.color = "#505050";
      } else {
        symbol.color = "#d0d0d0";
      }
    });
  });
}

function animate(currentTime) {
  requestAnimationFrame(animate);

  if (currentTime - lastTime < fpsInterval) return;

  lastTime = currentTime;
  drawBackground();
}

window.addEventListener("resize", resizeCanvas);
canvas.addEventListener("mousemove", handleMouseMove);

resizeCanvas();
requestAnimationFrame(animate);

// ==========================================================================
// GitHub Contributions Graph
// ==========================================================================
const GITHUB_USERNAME = "angelfire";
const WEEKS_TO_SHOW = 52;

async function fetchContributions(username) {
  const cachedRes = await fetch("/contributions-cache.json", {
    cache: "no-store",
  });
  if (cachedRes.ok) {
    const cachedPayload = await cachedRes.json();
    if (cachedPayload?.data) {
      return cachedPayload.data;
    }
  }

  const apiRes = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${username}`,
  );
  if (!apiRes.ok) throw new Error("Failed to fetch contributions");
  return apiRes.json();
}

function renderContributionsGraph(data) {
  const graph = document.getElementById("contributions-graph");
  const summary = document.getElementById("contributions-summary");
  if (!graph) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find the Sunday that starts the grid (WEEKS_TO_SHOW weeks ago)
  const startDate = new Date(today);
  startDate.setDate(
    startDate.getDate() - startDate.getDay() - (WEEKS_TO_SHOW - 1) * 7,
  );
  const startStr = startDate.toISOString().slice(0, 10);
  const todayStr = today.toISOString().slice(0, 10);

  // Build a map from API data
  const contribMap = {};
  for (const entry of data.contributions) {
    contribMap[entry.date] = entry;
  }

  graph.innerHTML = "";
  graph.style.setProperty("--weeks", WEEKS_TO_SHOW);

  let totalContributions = 0;
  const totalDays = WEEKS_TO_SHOW * 7;

  for (let i = 0; i < totalDays; i++) {
    const cellDate = new Date(startDate);
    cellDate.setDate(startDate.getDate() + i);
    const dateStr = cellDate.toISOString().slice(0, 10);
    const entry = contribMap[dateStr];
    const count = entry ? entry.count : 0;
    const level = entry ? entry.level : 0;
    const isFuture = dateStr > todayStr;

    if (!isFuture) {
      totalContributions += count;
    }

    const cell = document.createElement("div");
    cell.className = isFuture ? "contrib-cell" : "contrib-cell contrib-tooltip";
    cell.dataset.level = isFuture ? "0" : String(level);

    if (!isFuture) {
      cell.dataset.tooltip = `${count} contribution${count !== 1 ? "s" : ""} on ${cellDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }

    if (isFuture) {
      cell.style.opacity = "0.3";
    }

    graph.appendChild(cell);
  }

  const currentYear = today.getFullYear();
  const yearTotal = data.total[currentYear] || totalContributions;

  if (summary) {
    summary.textContent = `${yearTotal} contributions in ${currentYear}`;
  }
}

async function initContributions() {
  try {
    const data = await fetchContributions(GITHUB_USERNAME);
    renderContributionsGraph(data);
  } catch {
    const graph = document.getElementById("contributions-graph");
    if (graph) {
      graph.innerHTML =
        '<p class="contributions-loading">Could not load contributions</p>';
    }
  }
}

initContributions();
