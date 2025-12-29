document.addEventListener("DOMContentLoaded", () => {

  /* =======================
     ELEMENT REFERENCES
  ======================= */
  const boardEl = document.getElementById("board");
  const winLine = document.getElementById("winLine");
  const cells = document.querySelectorAll(".cell");
  const status = document.getElementById("status");
  const xWinsEl = document.getElementById("xWins");
  const oWinsEl = document.getElementById("oWins");

  /* =======================
     GAME CONSTANTS
  ======================= */
  const HUMAN = "X";
  const AI = "O";

  let currentPlayer = HUMAN;
  let board = Array(9).fill(null);
  let gameOver = false;

  /* =======================
     AUDIO
  ======================= */
  const clickSound = new Audio("sounds/click.mp3");
  const winSound = new Audio("sounds/win.mp3");

  clickSound.volume = 0.6;
  winSound.volume = 0.7;

  /* =======================
     WIN PATTERNS
  ======================= */
  const winPatterns = [
    { combo: [0,1,2] },
    { combo: [3,4,5] },
    { combo: [6,7,8] },

    { combo: [0,3,6] },
    { combo: [1,4,7] },
    { combo: [2,5,8] },

    { combo: [0,4,8] },
    { combo: [2,4,6] }
  ];

  /* =======================
     CELL CLICKS
  ======================= */
  cells.forEach((cell, i) => {
    cell.addEventListener("click", () => {
      if (board[i] || gameOver || currentPlayer !== HUMAN) return;

      makeMove(i, HUMAN);

      if (!gameOver && board.includes(null)) {
        setTimeout(aiMove, 400);
      }
    });
  });

  /* =======================
     MOVE HANDLER
  ======================= */
  function makeMove(index, player) {
    board[index] = player;
    cells[index].textContent = player;

    clickSound.currentTime = 0;
    clickSound.play().catch(() => {});

    const winData = checkWin(player);
    if (winData) {
      endGame(player, winData);
      return;
    }

    if (!board.includes(null)) {
      status.textContent = "It's a Draw!";
      gameOver = true;
      return;
    }

    currentPlayer = player === HUMAN ? AI : HUMAN;
  }

  /* =======================
     AI (SIMPLE + WORKING)
  ======================= */
  function aiMove() {
    if (gameOver) return;
    const move = findBestMove();
    if (move !== null) makeMove(move, AI);
  }

  function findBestMove() {

    // Try winning
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = AI;
        if (checkWin(AI)) {
          board[i] = null;
          return i;
        }
        board[i] = null;
      }
    }

    // Block human
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = HUMAN;
        if (checkWin(HUMAN)) {
          board[i] = null;
          return i;
        }
        board[i] = null;
      }
    }

    // Random
    const empty = board
      .map((v,i) => v === null ? i : null)
      .filter(v => v !== null);

    return empty.length
      ? empty[Math.floor(Math.random() * empty.length)]
      : null;
  }

  /* =======================
     WIN CHECK
  ======================= */
  function checkWin(player) {
    for (const p of winPatterns) {
      if (p.combo.every(i => board[i] === player)) {
        return p;
      }
    }
    return null;
  }

  /* =======================
     END GAME
  ======================= */
  function endGame(player, winData) {
    gameOver = true;

    winSound.currentTime = 0;
    winSound.play().catch(() => {});

    status.textContent = `Player ${player} wins!`;

    saveStats(player);
    updateScoreboard();
    drawWinLine(winData, player);
    launchConfetti();
  }

  /* =======================
     WIN LINE (PIXEL PERFECT)
  ======================= */
  function drawWinLine(pattern, player) {
    const boardRect = boardEl.getBoundingClientRect();

    const firstCell = cells[pattern.combo[0]].getBoundingClientRect();
    const lastCell  = cells[pattern.combo[2]].getBoundingClientRect();

    const x1 = firstCell.left + firstCell.width / 2 - boardRect.left;
    const y1 = firstCell.top  + firstCell.height / 2 - boardRect.top;

    const x2 = lastCell.left + lastCell.width / 2 - boardRect.left;
    const y2 = lastCell.top  + lastCell.height / 2 - boardRect.top;

    const length = Math.hypot(x2 - x1, y2 - y1);
    const angle  = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

    winLine.style.width = "0";
    winLine.style.left = `${x1}px`;
    winLine.style.top = `${y1}px`;
    winLine.style.background = player === "X" ? "#22d3ee" : "#ec4889";
    winLine.style.transformOrigin = "left center";
    winLine.style.transform = `rotate(${angle}deg)`;
    winLine.classList.add("pulse");

    requestAnimationFrame(() => {
      winLine.style.width = `${length}px`;
    });
  }

  /* =======================
     CONFETTI
  ======================= */
  function launchConfetti() {
    for (let i = 0; i < 40; i++) {
      const c = document.createElement("div");
      c.className = "confetti";
      c.style.left = Math.random() * window.innerWidth + "px";
      c.style.background = Math.random() > 0.5 ? "#22d3ee" : "#ec4889";
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 2500);
    }
  }

  /* =======================
     RESET
  ======================= */
  window.resetGame = function () {
    board.fill(null);
    gameOver = false;
    currentPlayer = HUMAN;

    cells.forEach(c => c.textContent = "");
    status.textContent = "";

    winLine.style.width = "0";
    winLine.style.transform = "none";
    winLine.classList.remove("pulse");
  };

  /* =======================
     STATS
  ======================= */
  function saveStats(winner) {
    const stats = JSON.parse(localStorage.getItem("tttStats")) || { X:0, O:0 };
    stats[winner]++;
    localStorage.setItem("tttStats", JSON.stringify(stats));
  }

  function updateScoreboard() {
    const stats = JSON.parse(localStorage.getItem("tttStats")) || { X:0, O:0 };
    xWinsEl.textContent = stats.X;
    oWinsEl.textContent = stats.O;
  }

  updateScoreboard();

});
