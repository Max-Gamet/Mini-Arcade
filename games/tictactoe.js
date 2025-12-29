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
  let botLevel = "medium";

  /* =======================
     AUDIO (SAFE LOAD)
  ======================= */
  const clickSound = new Audio("sounds/click.mp3");
  const winSound = new Audio("sounds/win.mp3");

  clickSound.volume = 0.6;
  winSound.volume = 0.7;

  /* =======================
     WIN PATTERNS
  ======================= */
  const winPatterns = [
    { combo: [0, 1, 2], type: "row", index: 0 },
    { combo: [3, 4, 5], type: "row", index: 1 },
    { combo: [6, 7, 8], type: "row", index: 2 },

    { combo: [0, 3, 6], type: "col", index: 0 },
    { combo: [1, 4, 7], type: "col", index: 1 },
    { combo: [2, 5, 8], type: "col", index: 2 },

    { combo: [0, 4, 8], type: "diag", dir: "main" },
    { combo: [2, 4, 6], type: "diag", dir: "anti" }
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
      DIFFICULTY LOGIC
  ========================*/

  document.querySelectorAll(".difficulty button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".difficulty button")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");
    botLevel = btn.dataset.level;

    resetGame();
    });
  });


  /* =======================
     AI LOGIC
  ======================= */
  function aiMove() {
  if (gameOver) return;

  const move = getAIMove();
  if (move !== null) makeMove(move, AI);
  }

  function findBestMove() {
    // Try to win
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

  function getAIMove() {
    if (botLevel === "easy") {
      const empty = board
        .map((v, i) => (v === null ? i : null))
        .filter(v => v !== null);
      return empty[Math.floor(Math.random() * empty.length)];
    }

    if (botLevel === "medium") {
      return findBestMove();
    }

    if (botLevel === "hard") {
      return minimaxMove();
    } 
  }

  function minimaxMove() {
    let bestScore = -Infinity;
    let move = null;

    for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = AI;
      let score = minimax(board, 0, false);
      board[i] = null;

      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
  }

  function minimax(boardState, depth, isMaximizing) {
    const winner = checkTerminal();

  if (winner !== null) {
    if (winner === AI) return 10 - depth;
    if (winner === HUMAN) return depth - 10;
    return 0;
  }

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (boardState[i] === null) {
        boardState[i] = AI;
        best = Math.max(best, minimax(boardState, depth + 1, false));
        boardState[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (boardState[i] === null) {
        boardState[i] = HUMAN;
        best = Math.min(best, minimax(boardState, depth + 1, true));
        boardState[i] = null;
      }
    }
    return best;
  }
  }

  function checkTerminal() {
    for (const p of winPatterns) {
    if (p.combo.every(i => board[i] === AI)) return AI;
    if (p.combo.every(i => board[i] === HUMAN)) return HUMAN;
  }
  return board.includes(null) ? null : "draw";
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

    // Random fallback
    const empty = board
      .map((v, i) => (v === null ? i : null))
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

  function launchConfetti() {
    for (let i = 0; i < 40; i++) {
      const c = document.createElement("div");
      c.className = "confetti";
      c.style.left = Math.random() * window.innerWidth + "px";
      c.style.background = Math.random() > 0.5 ? "#22d3ee" : "#ec4889"
      document.body.appendChild(c);

      setTimeout(() => c.remove(), 2500);
    }
  }

  /* =======================
     WIN LINE (FIXED)
  ======================= */
  
  function drawWinLine(pattern, player) {
    const boardRect = boardEl.getBoundingClientRect();

    const firstCell = cells[pattern.combo[0]].getBoundingClientRect();
    const lastCell = cells[pattern.combo[2]].getBoundingClientRect();

    const x1 = firstCell.left + firstCell.width / 2 - boardRect.left;
    const y1 = firstCell.top + firstCell.height / 2 - boardRect.top;

    const x2 = lastCell.left + lastCell.width / 2 - boardRect.left;
    const y2 = lastCell.top + lastCell.height / 2 - boardRect.top;

    const length = Math.hypot(x2 - x1, y2 - y1);
    const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

    winLine.style.width = "0px";
    winLine.style.height = "6px";
    winLine.style.left = `${x1}px`;
    winLine.style.top = `${y1}px`;
    winLine.style.transformOrigin = "left center";
    winLine.style.background = player === "X" ? "#22d3ee" : "#ec4889"
    winLine.style.color = winLine.style.background;
    winLine.style.transform = `rotate(${angle}deg)`;
    winLine.classList.add("pulse");

    requestAnimationFrame(() => {
      winLine.style.width = `${length}px`;
    });
  }


  /* =======================
     RESET
  ======================= */
  window.resetGame = function () {
    board.fill(null);
    gameOver = false;
    currentPlayer = HUMAN;

    cells.forEach(c => (c.textContent = ""));
    status.textContent = "";

    winLine.style.width = "0";
    winLine.style.transform = "none";
    winLine.classList.remove("pulse");
  };

  /* =======================
     STATS
  ======================= */
  function saveStats(winner) {
    const stats = JSON.parse(localStorage.getItem("tttStats")) || { X: 0, O: 0 };
    stats[winner]++;
    localStorage.setItem("tttStats", JSON.stringify(stats));
  }

  function updateScoreboard() {
    const stats = JSON.parse(localStorage.getItem("tttStats")) || { X: 0, O: 0 };
    xWinsEl.textContent = stats.X;
    oWinsEl.textContent = stats.O;
  }

  updateScoreboard();

  /* =======================
     NEON CURSOR
  ======================= */
  const cursor = document.createElement("div");
  cursor.className = "neon-cursor";
  document.body.appendChild(cursor);

  document.addEventListener("mousemove", e => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
  });

});
