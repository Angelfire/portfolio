/*
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

const themeColors = {
  light: { bg: "#f0f0f0", symbol: "#d0d0d0", hover: "#505050" },
  dark: { bg: "#1a1a1a", symbol: "#333333", hover: "#aaaaaa" },
};

function getTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getColors() {
  return themeColors[getTheme()];
}

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
        hovered: false,
      });
    }
    symbolGrid.push(row);
  }
}

function drawBackground() {
  const colors = getColors();
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "12px monospace";

  symbolGrid.forEach((row) => {
    row.forEach((s) => {
      ctx.fillStyle = s.hovered ? colors.hover : colors.symbol;
      ctx.fillText(s.symbol, s.x, s.y);
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
        symbol.hovered = true;
      } else {
        symbol.hovered = false;
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
*/

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const fps = 18;
const fpsInterval = 1000 / fps;
const cellSize = 14;

let grid = [];
let rows = 0;
let cols = 0;
let lastTime = 0;
let generationCount = 0;
let simulationStarted = false;
let recentStates = [];

const maxStateHistory = 12;

const lifeColors = {
  light: {
    bg: "#f4f1ea",
    cell: "#1f2937",
    fading: "#94a3b8",
    grid: "rgba(15, 23, 42, 0.08)",
    hudBg: "rgba(244, 241, 234, 0.88)",
    hudText: "#1f2937",
  },
  dark: {
    bg: "#0a0a0a",
    cell: "#fafafa",
    fading: "#2a2a2a",
    grid: "rgba(250, 250, 250, 0.08)",
    hudBg: "rgba(10, 10, 10, 0.88)",
    hudText: "#fafafa",
  },
};

function getTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getColors() {
  return lifeColors[getTheme()];
}

function createEmptyGrid(nextRows, nextCols) {
  return Array.from({ length: nextRows }, () =>
    Array.from({ length: nextCols }, () => 0),
  );
}

function seedPattern(targetGrid, originRow, originCol, pattern) {
  pattern.forEach((patternRow, rowOffset) => {
    patternRow.forEach((cell, colOffset) => {
      const rowIndex = originRow + rowOffset;
      const colIndex = originCol + colOffset;

      if (
        cell &&
        rowIndex >= 0 &&
        rowIndex < targetGrid.length &&
        colIndex >= 0 &&
        colIndex < targetGrid[0].length
      ) {
        targetGrid[rowIndex][colIndex] = 1;
      }
    });
  });
}

function seedInitialPattern() {
  const gosperGliderGun = [
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0,
      0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0,
      0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
      1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
      1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
  ];
  const rPentomino = [
    [0, 1, 1],
    [1, 1, 0],
    [0, 1, 0],
  ];
  const acorn = [
    [0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [1, 1, 0, 0, 1, 1, 1],
  ];

  const centerRow = Math.floor(rows / 2);
  const centerCol = Math.floor(cols / 2);

  seedPattern(
    grid,
    Math.max(2, centerRow - 12),
    Math.max(2, centerCol - 20),
    gosperGliderGun,
  );
  seedPattern(
    grid,
    Math.max(2, centerRow - 2),
    Math.max(2, centerCol + 10),
    rPentomino,
  );
  seedPattern(
    grid,
    Math.max(2, centerRow + 10),
    Math.max(2, centerCol - 8),
    acorn,
  );
}

function startSimulation() {
  if (simulationStarted) {
    return;
  }

  seedInitialPattern();
  generationCount = 0;
  lastTime = 0;
  recentStates = [];
  simulationStarted = true;
  drawGrid();
}

function restartSimulation() {
  grid = createEmptyGrid(rows, cols);
  generationCount = 0;
  lastTime = 0;
  recentStates = [];
  seedInitialPattern();
}

function resizeCanvas() {
  const shouldAutoStart =
    simulationStarted || document.readyState === "complete";

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  cols = Math.ceil(canvas.width / cellSize);
  rows = Math.ceil(canvas.height / cellSize);
  grid = createEmptyGrid(rows, cols);
  generationCount = 0;
  lastTime = 0;
  simulationStarted = false;
  recentStates = [];

  if (shouldAutoStart) {
    startSimulation();
  }
}

function countNeighbors(row, col) {
  let neighbors = 0;

  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
      if (rowOffset === 0 && colOffset === 0) {
        continue;
      }

      const nextRow = (row + rowOffset + rows) % rows;
      const nextCol = (col + colOffset + cols) % cols;
      neighbors += grid[nextRow][nextCol];
    }
  }

  return neighbors;
}

function getGridSignature() {
  return grid.map((row) => row.join("")).join("|");
}

function stepGrid() {
  const nextGrid = grid.map((row) => [...row]);
  const previousSignature = getGridSignature();

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const neighbors = countNeighbors(row, col);
      const isAlive = grid[row][col] === 1;

      if (isAlive && (neighbors < 2 || neighbors > 3)) {
        nextGrid[row][col] = 0;
      } else if (!isAlive && neighbors === 3) {
        nextGrid[row][col] = 1;
      }
    }
  }

  grid = nextGrid;
  generationCount += 1;

  const nextSignature = getGridSignature();
  recentStates.push(nextSignature);

  if (recentStates.length > maxStateHistory) {
    recentStates.shift();
  }

  const hasRepeatedState = recentStates.slice(0, -1).includes(nextSignature);
  const isStatic = nextSignature === previousSignature;

  if (isStatic || hasRepeatedState || getPopulation() === 0) {
    restartSimulation();
  }
}

function getPopulation() {
  return grid.reduce(
    (total, row) => total + row.reduce((rowTotal, cell) => rowTotal + cell, 0),
    0,
  );
}

function drawHud() {
  const colors = getColors();
  const population = getPopulation();
  const elapsedSeconds = generationCount / fps;
  const panelWidth = 168;
  const panelHeight = 62;
  const panelX = canvas.width - panelWidth - 16;
  const panelY = 16;

  ctx.fillStyle = colors.hudBg;
  ctx.globalAlpha = 1;
  ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

  ctx.fillStyle = colors.hudText;
  ctx.font = '12px "JetBrains Mono Variable", monospace';
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillText(`time ${elapsedSeconds.toFixed(1)}s`, canvas.width - 28, 28);
  ctx.fillText(`population ${population}`, canvas.width - 28, 46);
  ctx.textAlign = "left";
}

function drawGrid() {
  const colors = getColors();
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1;

  for (let x = 0; x <= canvas.width; x += cellSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= canvas.height; y += cellSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = col * cellSize;
      const y = row * cellSize;
      const inset = 2;

      ctx.fillStyle = grid[row][col] ? colors.cell : colors.fading;
      ctx.globalAlpha = grid[row][col] ? 0.9 : 0.18;
      ctx.fillRect(
        x + inset,
        y + inset,
        cellSize - inset * 2,
        cellSize - inset * 2,
      );
    }
  }

  ctx.globalAlpha = 1;
  drawHud();
}

function handleCanvasClick(event) {
  const rect = canvas.getBoundingClientRect();
  const col = Math.floor((event.clientX - rect.left) / cellSize);
  const row = Math.floor((event.clientY - rect.top) / cellSize);

  if (row >= 0 && row < rows && col >= 0 && col < cols) {
    grid[row][col] = grid[row][col] ? 0 : 1;
    drawGrid();
  }
}

function animate(currentTime) {
  requestAnimationFrame(animate);

  if (!simulationStarted) {
    return;
  }

  if (currentTime - lastTime < fpsInterval) {
    return;
  }

  lastTime = currentTime;
  stepGrid();
  drawGrid();
}

window.addEventListener("resize", resizeCanvas);
canvas.addEventListener("click", handleCanvasClick);
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", drawGrid);
window.addEventListener("load", startSimulation);

resizeCanvas();
drawGrid();
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
