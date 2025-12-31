const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");

const startbtn = document.getElementById("startbtn");
const resetbtn = document.getElementById("resetbtn");

const GRID = 20;
const TILES = canvas.width / GRID;

/* =======================
   GAME STATE
======================= */
let snake;
let food;
let score;
let direction;
let lastDirection;
let gameInterval;
let isRunning = false;
let portalSides = {
    top: false,
    bottom: false,
    left: false,
    right: false
};

/* SPEED CONTROL */
let speed = 150;
const minSpeed = 60;
const speedStep = 5;

/* =======================
   INIT
======================= */
function initGame() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 0, y: 0 };
  lastDirection = { x: 0, y: 0 };
  food = spawnFood();
  score = 0;
  speed = 150;
  isRunning = false;

  randomizePortals();

  draw();
}

document.addEventListener("touchmove", e => {
  e.preventDefault();
}, {passive: false});

document.querySelectorAll("#mobileControls button").forEach(btn => {
  btn.addEventListener("touchstart", e => {
    e.preventDefault();
    handleDirection(btn.dataset.dir);
  });
});

function handleDirection(dir) {
  if (!isRunning) return;

  if (dir === "up" && lastDirection.y !== 1) direction = { x: 0, y: -1};
  if (dir === "down" && lastDirection.y !== -1) direction = { x: 0, y: 1};
  if (dir === "left" && lastDirection.x !== 1) direction = { x: -1, y: 0};
  if (dir === "right" && lastDirection.x !== -1) direction = { x: 1, y: 0};
}

/* =======================
   GAME LOOP
======================= */
function startGameLoop() {
  clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, speed);
}

function gameLoop() {
  moveSnake();
  checkCollision();
  draw();
}

/* =======================
   CONTROLS
======================= */
document.addEventListener("keydown", e => {
  if (!isRunning) return;

  if (e.key === "ArrowUp" && lastDirection.y !== 1) direction = { x: 0, y: -1 };
  if (e.key === "ArrowDown" && lastDirection.y !== -1) direction = { x: 0, y: 1 };
  if (e.key === "ArrowLeft" && lastDirection.x !== 1) direction = { x: -1, y: 0 };
  if (e.key === "ArrowRight" && lastDirection.x !== -1) direction = { x: 1, y: 0 };
});

/* MOBILE SWIPE SUPPORT */
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener("touchstart", e => {
  const t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
});

document.addEventListener("touchend", e => {
  if (!isRunning) return;

  const t = e.changedTouches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && lastDirection.x !== -1) direction = { x: 1, y: 0 };
    if (dx < 0 && lastDirection.x !== 1) direction = { x: -1, y: 0 };
  } else {
    if (dy > 0 && lastDirection.y !== -1) direction = { x: 0, y: 1 };
    if (dy < 0 && lastDirection.y !== 1) direction = { x: 0, y: -1 };
  }
});

function randomizePortals() {
    portalSides = {
        top: false,
        bottom: false,
        left: false,
        right: false
    };

    const sides = ["top", "bottom", "left", "right"];

    while (Object.values(portalSides).filter(v => v).length < 2) {
        const randomSide = sides[Math.floor(Math.random() * sides.length)];
        portalSides[randomSide] = true;
    }
}

/* =======================
   BUTTONS
======================= */
startbtn.addEventListener("click", () => {
  if (isRunning) return;
  direction = { x: 1, y: 0 };
  lastDirection = { x: 1, y: 0 };
  isRunning = true;
  startGameLoop();
});

resetbtn.addEventListener("click", () => {
  clearInterval(gameInterval);
  initGame();
});

/* =======================
   SNAKE LOGIC
======================= */
function moveSnake() {
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.textContent = `Score: ${score}`;
    food = spawnFood();

    // SPEED UP
    speed = Math.max(minSpeed, speed - speedStep);
    startGameLoop();
  } else {
    snake.pop();
  }

  lastDirection = direction;
}

function checkCollision() {
  const head = snake[0];

  if (head.x < 0) head.x = TILES - 1;
  if (head.x >= TILES) head.x = 0;

  if (head.y < 0) head.y = TILES - 1;
  if (head.y >= TILES) head.y = 0;

  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      endGame();
    }
  }
}

/* =======================
   GAME OVER
======================= */
function endGame() {
  clearInterval(gameInterval);
  isRunning = false;

  const death = document.getElementById("deathScreen");
  const finalScore = document.getElementById("finalScore");

  finalScore.textContent = score;
  death.style.display = "flex";

  setTimeout(() => {
    death.style.display = "none";
    initGame();
  }, 2000);
}

/* =======================
   DRAW
======================= */
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;

    for (let i = 0; i <= TILES; i++) {
      ctx.beginPath();
      ctx.moveTo(i * GRID, 0);
      ctx.lineTo(i * GRID, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * GRID);
      ctx.lineTo(canvas.width, i * GRID);
      ctx.stroke();
    }

    ctx.fillStyle = "lime";
    snake.forEach((part, index) => {
      ctx.fillRect(
        part.x * GRID,
        part.y * GRID,
        GRID,
        GRID
      );

      if (index === 0) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(part.x * GRID + 6, part.y * GRID + 6, 2, 0, Math.PI * 2);
        ctx.arc(part.x * GRID + GRID - 6, part.y * GRID + 6, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "lime";
      }
    });

    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(
      food.x * GRID + GRID / 2,
      food.y * GRID + GRID / 2,
      GRID / 2.4,
      0,
      Math.PI * 2
    );
    ctx.fill();
}

/* =======================
   FOOD
======================= */
function spawnFood() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * TILES),
      y: Math.floor(Math.random() * TILES)
    };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
}

initGame();
