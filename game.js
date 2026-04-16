// ═══════════════════════════════════════════════════════════════
//  PACMAN — game.js
// ═══════════════════════════════════════════════════════════════

'use strict';

// ─── קבועים ───────────────────────────────────────────────────
const TILE = { EMPTY: 0, WALL: 1, DOT: 2, PELLET: 3, DOOR: 4, HOUSE: 5 };
const TILE_SIZE = 20;
const COLS = 28;
const ROWS = 31;
const TUNNEL_ROW = 14;

const STATE = { SELECT: 0, READY: 1, PLAYING: 2, DEAD: 3, WIN: 4, GAMEOVER: 5, PAUSE: 6 };

const FEAR_DURATION   = 8000;   // ms
const FEAR_FLASH_AT   = 2000;   // ms נותרים לפני שמתחיל הבהוב
const GHOST_BASE_SPEED = 120;   // px/s
const GHOST_SCARED_MULT = 0.45;
const GHOST_EATEN_MULT  = 2.0;
const GHOST_SCORES = [200, 400, 800, 1600];
const LIVES_START  = 3;
const READY_DURATION = 2200;    // ms

// ─── מבנה מבוך ─────────────────────────────────────────────────
// 0=ריק  1=קיר  2=נקודה  3=נקודת-כוח  4=דלת-בית  5=תוך-בית
const MAZE_DATA = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
  [1,3,1,0,0,1,2,1,0,0,0,1,2,1,1,2,1,0,0,0,1,2,1,0,0,1,3,1],
  [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
  [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
  [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
  [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
  [1,1,1,1,1,1,2,1,1,0,1,1,5,5,5,5,1,1,0,1,1,2,1,1,1,1,1,1],
  [1,1,1,1,1,1,2,1,1,0,1,5,5,5,5,5,5,1,0,1,1,2,1,1,1,1,1,1],
  [0,0,0,0,0,0,2,0,0,0,1,5,5,5,5,5,5,1,0,0,0,2,0,0,0,0,0,0],
  [1,1,1,1,1,1,2,1,1,0,1,5,5,5,5,5,5,1,0,1,1,2,1,1,1,1,1,1],
  [1,1,1,1,1,1,2,1,1,0,1,1,1,4,4,1,1,1,0,1,1,2,1,1,1,1,1,1],
  [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
  [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
  [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
  [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
  [1,3,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,1,1,2,2,3,1],
  [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
  [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
  [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
  [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// ─── הגדרות דמויות ──────────────────────────────────────────────
const CHARACTERS = {
  regel:  { id: 'regel',  label: 'רגל שלישית',   color: '#FFD700', img: 'רגל שלישית.jpeg',   speed: 190 },
  geshem: { id: 'geshem', label: 'גשם שוטף',      color: '#4FC3F7', img: 'גשם שוטף.jpeg',    speed: 200 },
  kotel:  { id: 'kotel',  label: 'קוטל הצעירים', color: '#EF5350', img: 'קוטל הצעירים.jpeg', speed: 75  },
};

// ─── הגדרות רוחות ───────────────────────────────────────────────
const GHOST_DEFS = [
  { id: 'blinky', color: '#FF0000', startCol: 13, startRow: 13, personality: 'chase',   exitDelay: 0    },
  { id: 'pinky',  color: '#FFB8FF', startCol: 14, startRow: 14, personality: 'ambush',  exitDelay: 3000 },
  { id: 'inky',   color: '#00FFFF', startCol: 13, startRow: 14, personality: 'flank',   exitDelay: 6500 },
  { id: 'clyde',  color: '#FFB852', startCol: 14, startRow: 13, personality: 'clyde',   exitDelay: 10000},
];

// ─── מצב גלובלי ─────────────────────────────────────────────────
let gameState   = STATE.SELECT;
let selectedChar = null;
let maze        = [];
let player      = {};
let ghosts      = [];
let score       = 0;
let lives       = LIVES_START;
let dotsTotal   = 0;
let dotsRemaining = 0;
let ghostEatenChain = 0;
let readyTimer  = 0;
let deadTimer   = 0;
let animFrameId = null;
let lastTimestamp = 0;
let gameTimestamp = 0; // for animations

// Canvas
const canvas  = document.getElementById('gameCanvas');
const ctx     = canvas.getContext('2d');

// Pre-loaded character images map
const charImages = {};

// ─── טעינת תמונות ───────────────────────────────────────────────
function preloadImages(callback) {
  const keys = Object.keys(CHARACTERS);
  let loaded = 0;
  keys.forEach(k => {
    const img = new Image();
    img.onload  = () => { loaded++; if (loaded === keys.length) callback(); };
    img.onerror = () => { loaded++; if (loaded === keys.length) callback(); };
    img.src = CHARACTERS[k].img;
    charImages[k] = img;
  });
}

// ─── אתחול מבוך ─────────────────────────────────────────────────
function buildMaze() {
  maze = MAZE_DATA.map(row => [...row]);
}

function countDots() {
  let n = 0;
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (maze[r][c] === TILE.DOT || maze[r][c] === TILE.PELLET) n++;
  return n;
}

// ─── יצירת שחקן ─────────────────────────────────────────────────
function createPlayer() {
  return {
    x: 14 * TILE_SIZE + TILE_SIZE / 2,
    y: 23 * TILE_SIZE + TILE_SIZE / 2,
    col: 14, row: 23,
    dir:     { x: 0, y: 0 },
    nextDir: { x: 0, y: 0 },
    speed:   selectedChar.speed,
    color:   selectedChar.color,
    charKey: selectedChar.id,
    mouthAngle: 0.25,
    mouthDir:   1,
    alive: true,
    deadAnim: 0,
    pendingStop: false,
  };
}

// ─── יצירת רוחות ────────────────────────────────────────────────
function createGhost(def) {
  return {
    ...def,
    x: def.startCol * TILE_SIZE + TILE_SIZE / 2,
    y: def.startRow * TILE_SIZE + TILE_SIZE / 2,
    col: def.startCol,
    row: def.startRow,
    dir:  { x: 1, y: 0 },
    speed: GHOST_BASE_SPEED,
    scared: false, scaredTimer: 0, flashing: false,
    eaten: false,
    inHouse: true,
    exitTimer: 0,
    pathQueue: [],
    pathTimer: 0,
    targetCol: 14, targetRow: 11,
  };
}

// ─── initGame ───────────────────────────────────────────────────
function initGame() {
  buildMaze();
  dotsTotal     = countDots();
  dotsRemaining = dotsTotal;
  score    = 0;
  lives    = LIVES_START;
  ghostEatenChain = 0;
  player   = createPlayer();
  ghosts   = GHOST_DEFS.map(d => createGhost(d));
  updateHUD();
  document.getElementById('hud-char-img').src = CHARACTERS[selectedChar.id].img;
  document.getElementById('hud-char-img').style.display = 'block';
  document.getElementById('hud-char-name').textContent  = selectedChar.label;
}

// ─── מעברי מסך ──────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ─── עדכון HUD ───────────────────────────────────────────────────
function updateHUD() {
  document.getElementById('hud-score').textContent = score;
  const hearts = '❤️'.repeat(Math.max(0, lives));
  document.getElementById('hud-lives').textContent = hearts || '💀';
}

// ═══════════════════════════════════════════════════════════════
//  רינדור
// ═══════════════════════════════════════════════════════════════

function render(dt) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawMaze();
  drawGhosts(dt);
  drawPlayer(dt);
  drawOverlay();
}

// ─── ציור מבוך ─────────────────────────────────────────────────
function drawMaze() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = maze[r][c];
      const px = c * TILE_SIZE;
      const py = r * TILE_SIZE;

      if (t === TILE.WALL) {
        drawWall(px, py);
      } else if (t === TILE.DOT) {
        ctx.fillStyle = '#FFE4B5';
        ctx.beginPath();
        ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (t === TILE.PELLET) {
        const pulse = 4 + Math.sin(gameTimestamp / 250) * 2;
        ctx.fillStyle = '#FFE4B5';
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (t === TILE.DOOR) {
        ctx.fillStyle = '#FFB8FF';
        ctx.fillRect(px + 2, py + TILE_SIZE / 2 - 2, TILE_SIZE - 4, 4);
      }
    }
  }
}

function drawWall(px, py) {
  const s = TILE_SIZE;
  // גוף
  ctx.fillStyle = '#1a1aff';
  ctx.fillRect(px, py, s, s);
  // highlight עליון/שמאלי
  ctx.fillStyle = '#3333ff';
  ctx.fillRect(px, py, s, 2);
  ctx.fillRect(px, py, 2, s);
  // צל תחתי/ימני
  ctx.fillStyle = '#0000aa';
  ctx.fillRect(px, py + s - 2, s, 2);
  ctx.fillRect(px + s - 2, py, 2, s);
}

// ─── ציור שחקן ─────────────────────────────────────────────────
function drawPlayer(dt) {
  if (gameState === STATE.DEAD) {
    drawPlayerDead();
    return;
  }

  const { x, y, mouthAngle, dir, charKey, color } = player;
  const r = TILE_SIZE / 2 - 1;

  // זווית פה לפי כיוון
  let baseAngle = 0;
  if (dir.x === 1)       baseAngle = 0;
  else if (dir.x === -1) baseAngle = Math.PI;
  else if (dir.y === 1)  baseAngle = Math.PI / 2;
  else if (dir.y === -1) baseAngle = -Math.PI / 2;

  const mouth      = mouthAngle * Math.PI;
  const startAngle = baseAngle + mouth;
  const endAngle   = baseAngle - mouth + Math.PI * 2;

  // צורת פקמן לחיתוך
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, r, startAngle, endAngle);
  ctx.closePath();

  const img = charImages[charKey];
  if (img && img.complete && img.naturalWidth > 0) {
    // חתוך לצורת פקמן ושרטט תמונה
    ctx.clip();
    ctx.drawImage(img, x - r, y - r, r * 2, r * 2);
    ctx.restore();

    // מסגרת צבעונית דקה סביב הפקמן
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur  = 8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, r, startAngle, endAngle);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  } else {
    // fallback: עיגול צבעוני אם התמונה לא נטענה
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }
}

function drawPlayerDead() {
  const { x, y, charKey, color, deadAnim } = player;
  const r        = TILE_SIZE / 2 - 1;
  const progress = Math.min(deadAnim / 800, 1);
  const startAngle = progress * Math.PI;
  const endAngle   = (2 - progress) * Math.PI;
  const radius     = r * (1 - progress * 0.3);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, radius, startAngle, endAngle);
  ctx.closePath();

  const img = charImages[charKey];
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.clip();
    ctx.globalAlpha = 1 - progress * 0.5;
    ctx.drawImage(img, x - radius, y - radius, radius * 2, radius * 2);
    ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = color;
    ctx.fill();
  }
  ctx.restore();
}

// ─── ציור רוחות ────────────────────────────────────────────────
function drawGhosts(dt) {
  ghosts.forEach(g => drawGhost(g));
}

function drawGhost(g) {
  const { x, y, scared, flashing, eaten, color } = g;
  const r  = TILE_SIZE / 2 - 1;
  const ts = gameTimestamp;

  if (eaten) {
    // עיניים בלבד כשנאכל
    drawGhostEyes(x, y, r, g.dir);
    return;
  }

  let bodyColor;
  if (scared) {
    if (flashing) {
      bodyColor = Math.floor(ts / 200) % 2 === 0 ? '#0000CC' : '#fff';
    } else {
      bodyColor = '#0000CC';
    }
  } else {
    bodyColor = color;
  }

  ctx.fillStyle = bodyColor;
  ctx.shadowColor = bodyColor;
  ctx.shadowBlur  = scared ? 0 : 8;

  // ראש מעוגל
  ctx.beginPath();
  ctx.arc(x, y - r * 0.1, r, Math.PI, 0, false);

  // חצאית מגורדנת
  const bottom = y + r * 0.9;
  const waves  = 3;
  const waveW  = (r * 2) / waves;
  ctx.lineTo(x + r, bottom);
  for (let i = 0; i < waves; i++) {
    const wx = x + r - i * waveW;
    ctx.quadraticCurveTo(wx - waveW * 0.25, bottom + r * 0.35, wx - waveW * 0.5, bottom);
    ctx.quadraticCurveTo(wx - waveW * 0.75, bottom - r * 0.25, wx - waveW, bottom);
  }
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // עיניים (לא כשפוחד)
  if (!scared) {
    drawGhostEyes(x, y, r, g.dir);
  } else {
    // פנים מפוחדות
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(x - r*0.3, y - r*0.1, 3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + r*0.3, y - r*0.1, 3, 0, Math.PI*2); ctx.fill();
    // פה עצוב
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - r*0.4, y + r*0.3);
    for (let i = 0; i <= 4; i++) {
      const bx = x - r*0.4 + i * (r*0.2);
      const by = y + r*0.3 + (i % 2 === 0 ? 3 : -3);
      i === 0 ? ctx.moveTo(bx, by) : ctx.lineTo(bx, by);
    }
    ctx.stroke();
  }
}

function drawGhostEyes(x, y, r, dir) {
  const ex = dir.x * r * 0.25;
  const ey = dir.y * r * 0.25;
  [-r*0.3, r*0.3].forEach(ox => {
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(x + ox, y - r*0.15, 3.5, 4, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#00f';
    ctx.beginPath(); ctx.arc(x + ox + ex*0.5, y - r*0.15 + ey*0.5, 2, 0, Math.PI*2); ctx.fill();
  });
}

// ─── שכבת טקסט ─────────────────────────────────────────────────
function drawOverlay() {
  if (gameState === STATE.READY) {
    const alpha = Math.abs(Math.sin(gameTimestamp / 400));
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 28px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('מוכן', canvas.width / 2, canvas.height / 2);
    ctx.globalAlpha = 1;
  }
}

// ═══════════════════════════════════════════════════════════════
//  קלט — מקלדת + מגע
// ═══════════════════════════════════════════════════════════════

const KEY_DIRS = {
  ArrowLeft:  { x:-1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp:    { x: 0, y:-1 },
  ArrowDown:  { x: 0, y: 1 },
};

function setDir(dir) {
  if (gameState !== STATE.PLAYING && gameState !== STATE.READY) return;
  player.nextDir = dir;
}

// Keyboard: hold = move continuously, release = stop immediately
const keysHeld = new Set();

document.addEventListener('keydown', e => {
  const d = KEY_DIRS[e.key];
  if (!d) return;
  e.preventDefault();
  keysHeld.add(e.key);
  if (gameState !== STATE.PLAYING && gameState !== STATE.READY) return;
  player.nextDir = { x: d.x, y: d.y };
});

document.addEventListener('keyup', e => {
  const d = KEY_DIRS[e.key];
  if (!d) return;
  keysHeld.delete(e.key);
  if (gameState !== STATE.PLAYING && gameState !== STATE.READY) return;
  const stillHeldKey = Object.keys(KEY_DIRS).find(k => keysHeld.has(k));
  if (stillHeldKey) {
    // Another direction key still held — switch to it
    const nd = KEY_DIRS[stillHeldKey];
    player.nextDir = { x: nd.x, y: nd.y };
  } else {
    // No key held — snap to tile center and stop
    player.x      = player.col * TILE_SIZE + TILE_SIZE / 2;
    player.y      = player.row * TILE_SIZE + TILE_SIZE / 2;
    player.dir    = { x: 0, y: 0 };
    player.nextDir = { x: 0, y: 0 };
  }
});

// D-pad: start moving on press, stop on release (mobile only — keyboard handled separately)
function stopPlayer() {
  if (gameState !== STATE.PLAYING && gameState !== STATE.READY) return;
  player.nextDir    = { x: 0, y: 0 }; // clear buffered turn
  player.pendingStop = true;           // finish current tile movement, then stop
}

const DPAD_DIRS = [
  { id: 'btn-up',    dir: { x: 0, y:-1 } },
  { id: 'btn-down',  dir: { x: 0, y: 1 } },
  { id: 'btn-left',  dir: { x:-1, y: 0 } },
  { id: 'btn-right', dir: { x: 1, y: 0 } },
];
DPAD_DIRS.forEach(({ id, dir }) => {
  const btn = document.getElementById(id);
  btn.addEventListener('pointerdown',  e => { e.preventDefault(); setDir(dir); });
  btn.addEventListener('pointerup',    e => { e.preventDefault(); stopPlayer(); });
  btn.addEventListener('pointercancel',e => { e.preventDefault(); stopPlayer(); });
});

// Swipe על הקנבס
(function() {
  let sx = 0, sy = 0;
  canvas.addEventListener('touchstart', e => {
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
    e.preventDefault();
  }, { passive: false });
  canvas.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      setDir(dx > 0 ? { x: 1, y: 0 } : { x:-1, y: 0 });
    } else {
      setDir(dy > 0 ? { x: 0, y: 1 } : { x: 0, y:-1 });
    }
    e.preventDefault();
  }, { passive: false });
})();

// ═══════════════════════════════════════════════════════════════
//  תנועה
// ═══════════════════════════════════════════════════════════════

function tileCenter(col, row) {
  return { x: col * TILE_SIZE + TILE_SIZE / 2, y: row * TILE_SIZE + TILE_SIZE / 2 };
}

function pixelToTile(px) { return Math.floor(px / TILE_SIZE); }

function canMoveTo(col, row, isGhost, ghostEaten) {
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return false;
  const t = maze[row][col];
  if (t === TILE.WALL) return false;
  if (t === TILE.DOOR && !ghostEaten) return false; // רוחות לא עוברות את הדלת אלא כשחוזרות
  return true;
}

function wrapTunnel(entity) {
  const halfTile = TILE_SIZE / 2;
  if (entity.row === TUNNEL_ROW) {
    if (entity.x < -halfTile)                   entity.x = COLS * TILE_SIZE + halfTile;
    if (entity.x > COLS * TILE_SIZE + halfTile)  entity.x = -halfTile;
  }
}

function movePlayer(dt) {
  if (!player.alive) return;

  // Mouth animation — always runs
  player.mouthAngle += player.mouthDir * 0.05;
  if (player.mouthAngle >= 0.25) player.mouthDir = -1;
  if (player.mouthAngle <= 0.02) player.mouthDir =  1;

  // If stopped, try to start moving from nextDir
  if (player.dir.x === 0 && player.dir.y === 0) {
    const nd = player.nextDir;
    if (nd.x === 0 && nd.y === 0) return; // no input — stay still
    // Snap to current tile center, then start if direction is open
    player.x = player.col * TILE_SIZE + TILE_SIZE / 2;
    player.y = player.row * TILE_SIZE + TILE_SIZE / 2;
    if (!canMoveTo(player.col + nd.x, player.row + nd.y, false, false)) return;
    player.dir = { x: nd.x, y: nd.y };
  }

  const spd = player.speed * (dt / 1000);

  // Turn logic — applies to all inputs (D-pad and keyboard alike)
  const nd = player.nextDir;
  if (nd.x !== 0 || nd.y !== 0) {
    // U-turn (180°): always allowed immediately — no tile-center needed
    const isUTurn = (nd.x === -player.dir.x && nd.y === -player.dir.y);
    if (isUTurn) {
      player.x   = player.col * TILE_SIZE + TILE_SIZE / 2;
      player.y   = player.row * TILE_SIZE + TILE_SIZE / 2;
      player.dir = { x: nd.x, y: nd.y };
    } else if (nd.x !== player.dir.x || nd.y !== player.dir.y) {
      // Perpendicular turn: allow when within half a tile of the current tile center
      const cx = player.col * TILE_SIZE + TILE_SIZE / 2;
      const cy = player.row * TILE_SIZE + TILE_SIZE / 2;
      if (Math.hypot(player.x - cx, player.y - cy) <= TILE_SIZE * 0.5) {
        if (canMoveTo(player.col + nd.x, player.row + nd.y, false, false)) {
          player.x   = cx;
          player.y   = cy;
          player.dir = { x: nd.x, y: nd.y };
        }
      }
    }
  }

  // Tile-targeting: move toward center of (col+dir, row+dir)
  const targetCol = player.col + player.dir.x;
  const targetRow = player.row + player.dir.y;

  if (!canMoveTo(targetCol, targetRow, false, false)) {
    // Wall ahead — stop at current tile center
    player.x   = player.col * TILE_SIZE + TILE_SIZE / 2;
    player.y   = player.row * TILE_SIZE + TILE_SIZE / 2;
    player.dir = { x: 0, y: 0 };
    return;
  }

  const tx   = targetCol * TILE_SIZE + TILE_SIZE / 2;
  const ty   = targetRow * TILE_SIZE + TILE_SIZE / 2;
  const dx   = tx - player.x;
  const dy   = ty - player.y;
  const dist = Math.hypot(dx, dy);

  if (dist <= spd) {
    // Arrived at target tile — snap and try to turn
    player.x   = tx;
    player.y   = ty;
    player.col = targetCol;
    player.row = targetRow;

    // D-pad release requested a stop — halt here at tile center
    if (player.pendingStop) {
      player.dir        = { x: 0, y: 0 };
      player.pendingStop = false;
      return;
    }

    const nd = player.nextDir;
    if (nd.x !== 0 || nd.y !== 0) {
      if (canMoveTo(player.col + nd.x, player.row + nd.y, false, false)) {
        player.dir = { x: nd.x, y: nd.y };
      }
    }

    // Check the (possibly new) direction is still open
    if (!canMoveTo(player.col + player.dir.x, player.row + player.dir.y, false, false)) {
      player.dir = { x: 0, y: 0 };
    }
  } else {
    player.x += (dx / dist) * spd;
    player.y += (dy / dist) * spd;
  }

  wrapTunnel(player);
  player.col = Math.floor(player.x / TILE_SIZE);
  player.row = Math.floor(player.y / TILE_SIZE);
}

// ═══════════════════════════════════════════════════════════════
//  בינה מלאכותית — רוחות
// ═══════════════════════════════════════════════════════════════

function bfsStep(sc, sr, tc, tr, ghost) {
  if (sc === tc && sr === tr) return null;
  const queue   = [{ col: sc, row: sr, first: null }];
  const visited = new Set([`${sc},${sr}`]);
  const dirs    = [{x:0,y:-1},{x:0,y:1},{x:-1,y:0},{x:1,y:0}];

  while (queue.length > 0) {
    const { col, row, first } = queue.shift();
    for (const d of dirs) {
      const nc = col + d.x;
      const nr = row + d.y;
      const key = `${nc},${nr}`;
      if (!visited.has(key) && canMoveTo(nc, nr, true, ghost.eaten)) {
        visited.add(key);
        const step = first || { col: nc, row: nr };
        if (nc === tc && nr === tr) return step;
        queue.push({ col: nc, row: nr, first: step });
      }
    }
  }
  return null;
}

function getGhostTarget(ghost) {
  if (ghost.eaten) return { col: 14, row: 14 };

  if (ghost.scared) {
    // בריחה: כיוון הפוך מהשחקן
    const fc = Math.max(0, Math.min(COLS-1, ghost.col + (ghost.col - player.col)));
    const fr = Math.max(0, Math.min(ROWS-1, ghost.row + (ghost.row - player.row)));
    return { col: fc, row: fr };
  }

  switch (ghost.personality) {
    case 'chase':
      return { col: player.col, row: player.row };
    case 'ambush':
      return {
        col: Math.max(0, Math.min(COLS-1, player.col + player.dir.x * 4)),
        row: Math.max(0, Math.min(ROWS-1, player.row + player.dir.y * 4)),
      };
    case 'flank': {
      const blinky = ghosts[0];
      const mid = { col: player.col + player.dir.x*2, row: player.row + player.dir.y*2 };
      return {
        col: Math.max(0, Math.min(COLS-1, mid.col + (mid.col - blinky.col))),
        row: Math.max(0, Math.min(ROWS-1, mid.row + (mid.row - blinky.row))),
      };
    }
    case 'clyde': {
      const dist = Math.abs(ghost.col - player.col) + Math.abs(ghost.row - player.row);
      return dist > 8
        ? { col: player.col, row: player.row }
        : { col: 1, row: ROWS-2 };
    }
    default:
      return { col: player.col, row: player.row };
  }
}

function updateGhosts(dt) {
  ghosts.forEach(g => updateGhost(g, dt));
}

function updateGhost(g, dt) {
  // עדכון טיימר יציאה מהבית
  if (g.inHouse) {
    g.exitTimer += dt;
    if (g.exitTimer >= g.exitDelay) {
      g.inHouse = false;
      g.x = 14 * TILE_SIZE + TILE_SIZE / 2;
      g.y = 16 * TILE_SIZE + TILE_SIZE / 2;
      g.col = 14; g.row = 16;
      g.dir = { x: 0, y: -1 };
    }
    return;
  }

  // עדכון מצב פחד
  if (g.scared) {
    g.scaredTimer -= dt;
    if (g.scaredTimer <= FEAR_FLASH_AT) g.flashing = true;
    if (g.scaredTimer <= 0) {
      g.scared = false;
      g.flashing = false;
      g.speed = GHOST_BASE_SPEED;
    }
  }

  // עדכון מסלול BFS
  g.pathTimer -= dt;
  if (g.pathTimer <= 0) {
    g.pathTimer = 200;
    const target = getGhostTarget(g);
    const step   = bfsStep(g.col, g.row, target.col, target.row, g);
    if (step) {
      g.targetCol = step.col;
      g.targetRow = step.row;
      g.dir = { x: step.col - g.col, y: step.row - g.row };
    }
  }

  // תנועה לעבר יעד הבא
  const tc = tileCenter(g.targetCol, g.targetRow);
  const dx = tc.x - g.x;
  const dy = tc.y - g.y;
  const dist = Math.sqrt(dx*dx + dy*dy);
  const spd  = g.speed * (dt / 1000);

  if (dist <= spd) {
    g.x = tc.x;
    g.y = tc.y;
    g.col = g.targetCol;
    g.row = g.targetRow;
    // כש"נאכל" ומגיע לבית — חזרה
    if (g.eaten && g.col === 14 && g.row === 14) {
      g.eaten   = false;
      g.inHouse = true;
      g.exitTimer = g.exitDelay * 0.5; // חזרה מהירה יותר
      g.speed   = GHOST_BASE_SPEED;
      g.scared  = false;
      g.flashing= false;
    }
  } else {
    g.x += (dx / dist) * spd;
    g.y += (dy / dist) * spd;
  }

  wrapTunnel(g);
  g.col = pixelToTile(g.x);
  g.row = pixelToTile(g.y);
}

// ═══════════════════════════════════════════════════════════════
//  התנגשויות
// ═══════════════════════════════════════════════════════════════

function checkDotCollect() {
  const c = player.col;
  const r = player.row;
  if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return;
  const t = maze[r][c];
  if (t === TILE.DOT) {
    maze[r][c] = TILE.EMPTY;
    addScore(10);
    dotsRemaining--;
    checkWin();
  } else if (t === TILE.PELLET) {
    maze[r][c] = TILE.EMPTY;
    addScore(50);
    dotsRemaining--;
    activateFearMode();
    checkWin();
  }
}

function checkGhostCollision() {
  if (gameState !== STATE.PLAYING) return;
  ghosts.forEach(g => {
    if (g.inHouse || g.eaten) return;
    const dx = player.x - g.x;
    const dy = player.y - g.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < TILE_SIZE * 0.75) {
      if (g.scared) {
        eatGhost(g);
      } else {
        killPlayer();
      }
    }
  });
}

function activateFearMode() {
  ghostEatenChain = 0;
  ghosts.forEach(g => {
    if (!g.eaten && !g.inHouse) {
      g.scared     = true;
      g.flashing   = false;
      g.scaredTimer = FEAR_DURATION;
      g.speed      = GHOST_BASE_SPEED * GHOST_SCARED_MULT;
      // הפוך כיוון
      g.dir = { x: -g.dir.x, y: -g.dir.y };
      g.targetCol = g.col + g.dir.x;
      g.targetRow = g.row + g.dir.y;
    }
  });
}

function eatGhost(ghost) {
  const pts = GHOST_SCORES[Math.min(ghostEatenChain, 3)];
  ghostEatenChain++;
  addScore(pts);
  ghost.scared   = false;
  ghost.flashing = false;
  ghost.eaten    = true;
  ghost.speed    = GHOST_BASE_SPEED * GHOST_EATEN_MULT;
  ghost.targetCol = 14;
  ghost.targetRow = 14;
}

function killPlayer() {
  if (gameState !== STATE.PLAYING) return;
  lives--;
  updateHUD();
  gameState = STATE.DEAD;
  player.alive  = false;
  player.deadAnim = 0;
  deadTimer = 0;
}

// ═══════════════════════════════════════════════════════════════
//  ניקוד וסיום
// ═══════════════════════════════════════════════════════════════

function addScore(pts) {
  score += pts;
  document.getElementById('hud-score').textContent = score;
}

function checkWin() {
  if (dotsRemaining <= 0) {
    gameState = STATE.WIN;
    showEndScreen(true);
  }
}

function showEndScreen(won) {
  document.getElementById('gameover-title').textContent = won ? 'ניצחת! 🎉' : 'משחק נגמר';
  document.getElementById('gameover-title').style.color = won ? '#FFD700' : '#EF5350';
  document.getElementById('gameover-score').textContent = `ניקוד סופי: ${score}`;
  setTimeout(() => showScreen('screen-gameover'), 1500);
}

function resetRound() {
  player   = createPlayer();
  ghosts   = GHOST_DEFS.map(d => createGhost(d));
  ghostEatenChain = 0;
  gameState = STATE.READY;
  readyTimer = 0;
}

// ═══════════════════════════════════════════════════════════════
//  לולאת משחק
// ═══════════════════════════════════════════════════════════════

function update(dt) {
  if (gameState === STATE.PAUSE) return; // frozen — do not advance anything

  gameTimestamp += dt;

  if (gameState === STATE.READY) {
    readyTimer += dt;
    if (readyTimer >= READY_DURATION) {
      gameState = STATE.PLAYING;
    }
    return;
  }

  if (gameState === STATE.DEAD) {
    player.deadAnim += dt;
    deadTimer += dt;
    if (deadTimer >= 1800) {
      if (lives <= 0) {
        gameState = STATE.GAMEOVER;
        showEndScreen(false);
      } else {
        resetRound();
      }
    }
    return;
  }

  if (gameState !== STATE.PLAYING) return;

  movePlayer(dt);
  updateGhosts(dt);
  checkDotCollect();
  checkGhostCollision();
}

function gameLoop(timestamp) {
  animFrameId = requestAnimationFrame(gameLoop);
  const dt = Math.min(timestamp - lastTimestamp, 50);
  lastTimestamp = timestamp;
  update(dt);
  render(dt);
}

function startGameLoop() {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  lastTimestamp = performance.now();
  gameTimestamp = 0;
  animFrameId   = requestAnimationFrame(gameLoop);
}

// ═══════════════════════════════════════════════════════════════
//  אירועי ממשק
// ═══════════════════════════════════════════════════════════════

document.querySelectorAll('.char-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedChar = CHARACTERS[card.dataset.char];
    const prompt = document.getElementById('start-prompt');
    prompt.classList.remove('hidden');
  });
});

document.getElementById('start-prompt').addEventListener('click', () => {
  if (!selectedChar) return;
  initGame();
  showScreen('screen-game');
  fitCanvas();
  gameState  = STATE.READY;
  readyTimer = 0;
  startGameLoop();
});

document.getElementById('btn-restart').addEventListener('click', () => {
  initGame();
  showScreen('screen-game');
  fitCanvas();
  gameState  = STATE.READY;
  readyTimer = 0;
  startGameLoop();
});

document.getElementById('btn-change-char').addEventListener('click', () => {
  if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
  selectedChar = null;
  document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('start-prompt').classList.add('hidden');
  showScreen('screen-select');
});

// ─── כפתור בית: השהייה ────────────────────────────────────────
document.getElementById('btn-home').addEventListener('click', () => {
  if (gameState !== STATE.PLAYING) return; // only pause while actively playing
  gameState = STATE.PAUSE;
  document.getElementById('exit-overlay').classList.add('visible');
});

// "המשך לשחק" — unpause and return to game
document.getElementById('btn-exit-no').addEventListener('click', () => {
  document.getElementById('exit-overlay').classList.remove('visible');
  if (gameState === STATE.PAUSE) gameState = STATE.PLAYING;
});

// "יצא לתפריט" — leave without resetting maze/score until a new game starts
document.getElementById('btn-exit-yes').addEventListener('click', () => {
  document.getElementById('exit-overlay').classList.remove('visible');
  gameState = STATE.SELECT;
  if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
  selectedChar = null;
  document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('start-prompt').classList.add('hidden');
  showScreen('screen-select');
});

document.getElementById('btn-add-player').addEventListener('click', () => {
  showScreen('screen-add-player');
});

document.getElementById('btn-back-to-select').addEventListener('click', () => {
  showScreen('screen-select');
});

// ─── Canvas scaling — fits canvas inside available viewport ──────
function fitCanvas() {
  const wrapper = document.getElementById('game-wrapper');
  const hud     = document.getElementById('hud');
  const dpad    = document.getElementById('dpad');

  // visualViewport.height accounts for mobile browser address bar;
  // falls back to window.innerHeight on desktop
  const vh = (window.visualViewport ? window.visualViewport.height : window.innerHeight);

  const hudH  = hud.offsetHeight || 50;

  // Read actual rendered dpad height — only on touch devices
  const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const dpadH = isTouchDevice ? (dpad.offsetHeight || 200) : 0;

  const availW = Math.min(window.innerWidth, 560);
  const availH = vh - hudH - dpadH - 4; // 4px safety buffer

  // Maintain 560:620 aspect ratio — pick the smaller of both constraints
  const byWidth  = availW;
  const byHeight = Math.floor(availH * 560 / 620);
  const cssW     = Math.max(1, Math.min(byWidth, byHeight));
  const cssH     = Math.floor(cssW * 620 / 560);

  wrapper.style.width = cssW + 'px';
  canvas.style.width  = cssW + 'px';
  canvas.style.height = cssH + 'px';
}

window.addEventListener('resize', fitCanvas);
// visualViewport fires when mobile browser address bar shows/hides
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', fitCanvas);
}
fitCanvas();

// ─── טעינה ראשונית ──────────────────────────────────────────────
preloadImages(() => {
  // Images loaded — re-run fitCanvas now that DOM is fully rendered
  fitCanvas();
});
