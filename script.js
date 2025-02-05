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
