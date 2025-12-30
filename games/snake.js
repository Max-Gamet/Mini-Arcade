const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");

const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;

// Snake
let snake = [
  { x: 10, y: 10 }
];

let direction = { x: 0, y: 0 };
let food = spawnFood();
let score = 0;
let gameOver = false;

// Game loop
setInterval(gameLoop, 100);

// Controls
document.addEventListener("keydown", e => {
  if (e.key === "ArrowUp" && direction.y === 0) direction = { x: 0, y: -1 };
  if (e.key === "ArrowDown" && direction.y === 0) direction = { x: 0, y: 1 };
  if (e.key === "ArrowLeft" && direction.x === 0) direction = { x: -1, y: 0 };
  if (e.key === "ArrowRight" && direction.x === 0) direction = { x: 1, y: 0 };
});

function gameLoop() {
  if (gameOver) return;

  moveSnake();
  checkCollision();
  draw();
}

function moveSnake() {
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  snake.unshift(head);

  // Eat food
  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.textContent = `Score: ${score}`;
    food = spawnFood();
  } else {
    snake.pop();
  }
}

function checkCollision() {
  const head = snake[0];

  // Wall collision
  if (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= TILE_COUNT ||
    head.y >= TILE_COUNT
  ) {
    gameOver = true;
    alert("Game Over!");
  }

  // Self collision
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      gameOver = true;
      alert("Game Over!");
    }
  }
}

function spawnFood() {
  return {
    x: Math.floor(Math.random() * TILE_COUNT),
    y: Math.floor(Math.random() * TILE_COUNT)
  };
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  ctx.fillStyle = "#22d3ee";
  snake.forEach(part => {
    ctx.fillRect(
      part.x * GRID_SIZE,
      part.y * GRID_SIZE,
      GRID_SIZE,
      GRID_SIZE
    );
  });

  // Draw food
  ctx.fillStyle = "#ec4899";
  ctx.fillRect(
    food.x * GRID_SIZE,
    food.y * GRID_SIZE,
    GRID_SIZE,
    GRID_SIZE
  );
}
