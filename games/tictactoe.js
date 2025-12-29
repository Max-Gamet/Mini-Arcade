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
     AUDIO
  ======================= */
  const clickSound = new Audio("sounds/click.mp3");
  const winSound = new Audio("sounds/win.mp3");

  clickSound.volume = 0.6;
  winSound.volume = 0.7;

  /* =======================
     DIFFICULTY SELECTOR
  ======================= */
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
     WIN PATTERNS
  ======================= */
  const winPatterns = [
    { combo: [0,1,2] }, { combo: [3,4,5] }, { combo: [6,7,8] },
    { combo: [0,3,6] }, { combo: [1,4,7] }, { combo: [2,5,8] },
    { combo: [0,4,8] }, { combo: [2,4,6] }
  ];

  /* =======================
     CELL CLICKS
  ======================= */
  cells.forEach((cell, i) => {
    cell.addEventListener("click", () => {
      if (board[i] || gameOver || currentPlayer !== HUMAN) return;
      makeMove(i, HUMAN);
      if (!gameOver) setTimeout(aiMove, 400);
    });
  });

  /* =======================
     MOVE HANDLER
  ======================= */
  function makeMove(index, player) {
    board[index] = player;
    cells[index].textContent = player;

    clickSound.currentTime = 0;
    clickSound.play().catch(()=>{});

    const winData = checkWin(player);
    if (winData) return endGame(player, winData);

    if (!board.includes(null)) {
      status.textContent = "It's a Draw!";
      gameOver = true;
      return;
    }

    currentPlayer = player === HUMAN ? AI : HUMAN;
  }

  /* =======================
     AI ENTRY
  ======================= */
  function aiMove() {
    if (gameOver) return;
    const move = getAIMove();
    if (move !== null) makeMove(move, AI);
  }

  /* =======================
     EASY BOT HELPERS
  ======================= */
  function getRandomMove() {
    const empty = board.map((v,i)=>v===null?i:null).filter(i=>i!==null);
    return empty.length ? empty[Math.floor(Math.random()*empty.length)] : null;
  }

  function findCriticalMove(player) {
    for (const p of winPatterns) {
      const vals = p.combo.map(i => board[i]);
      if (vals.filter(v => v === player).length === 2 && vals.includes(null)) {
        return p.combo[vals.indexOf(null)];
      }
    }
    return null;
  }

  /* =======================
     AI MOVE SELECTOR
  ======================= */
  function getAIMove() {
    if (botLevel === "easy") {
      return findCriticalMove(AI) ??
             findCriticalMove(HUMAN) ??
             getRandomMove();
    }

    if (botLevel === "medium") {
      return findCriticalMove(AI) ??
             findCriticalMove(HUMAN) ??
             getRandomMove();
    }

    return minimaxMove();
  }

  /* =======================
     HARD BOT (MINIMAX)
  ======================= */
  function minimaxMove() {
    let bestScore = -Infinity;
    let move = null;

    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = AI;
        const score = minimax(board, 0, false);
        board[i] = null;

        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  }

  function minimax(state, depth, isMax) {
    const result = checkTerminal(state);
    if (result !== null) {
      if (result === AI) return 10 - depth;
      if (result === HUMAN) return depth - 10;
      return 0;
    }

    if (isMax) {
      let best = -Infinity;
      for (let i=0;i<9;i++) {
        if (state[i] === null) {
          state[i] = AI;
          best = Math.max(best, minimax(state, depth+1, false));
          state[i] = null;
        }
      }
      return best;
    } else {
      let best = Infinity;
      for (let i=0;i<9;i++) {
        if (state[i] === null) {
          state[i] = HUMAN;
          best = Math.min(best, minimax(state, depth+1, true));
          state[i] = null;
        }
      }
      return best;
    }
  }

  function checkTerminal(state) {
    for (const p of winPatterns) {
      if (p.combo.every(i => state[i] === AI)) return AI;
      if (p.combo.every(i => state[i] === HUMAN)) return HUMAN;
    }
    return state.includes(null) ? null : "draw";
  }

  /* =======================
     WIN CHECK
  ======================= */
  function checkWin(player) {
    return winPatterns.find(p => p.combo.every(i => board[i] === player)) || null;
  }

  /* =======================
     END GAME
  ======================= */
  function endGame(player, winData) {
    gameOver = true;
    winSound.currentTime = 0;
    winSound.play().catch(()=>{});
    status.textContent = `Player ${player} wins!`;
    saveStats(player);
    updateScoreboard();
    drawWinLine(winData, player);
    launchConfetti();
  }

  function launchConfetti() {
    for (let i=0;i<40;i++) {
      const c = document.createElement("div");
      c.className = "confetti";
      c.style.left = Math.random()*window.innerWidth+"px";
      c.style.background = Math.random()>0.5?"#22d3ee":"#ec4889";
      document.body.appendChild(c);
      setTimeout(()=>c.remove(),2500);
    }
  }

  /* =======================
     WIN LINE
  ======================= */
  function drawWinLine(pattern, player) {
    const boardRect = boardEl.getBoundingClientRect();
    const a = cells[pattern.combo[0]].getBoundingClientRect();
    const b = cells[pattern.combo[2]].getBoundingClientRect();

    const x1 = a.left + a.width/2 - boardRect.left;
    const y1 = a.top + a.height/2 - boardRect.top;
    const x2 = b.left + b.width/2 - boardRect.left;
    const y2 = b.top + b.height/2 - boardRect.top;

    const length = Math.hypot(x2-x1, y2-y1);
    const angle = Math.atan2(y2-y1, x2-x1) * 180 / Math.PI;

    winLine.style.left = x1+"px";
    winLine.style.top = y1+"px";
    winLine.style.width = "0px";
    winLine.style.transform = `rotate(${angle}deg)`;
    winLine.style.background = player==="X"?"#22d3ee":"#ec4889";
    winLine.classList.add("pulse");

    requestAnimationFrame(()=>winLine.style.width = length+"px");
  }

  /* =======================
     RESET
  ======================= */
  window.resetGame = function () {
    board.fill(null);
    gameOver = false;
    currentPlayer = HUMAN;
    cells.forEach(c=>c.textContent="");
    status.textContent = "";
    winLine.style.width="0";
    winLine.classList.remove("pulse");
  };

  /* =======================
     STATS
  ======================= */
  function saveStats(w) {
    const s = JSON.parse(localStorage.getItem("tttStats")) || {X:0,O:0};
    s[w]++; localStorage.setItem("tttStats",JSON.stringify(s));
  }

  function updateScoreboard() {
    const s = JSON.parse(localStorage.getItem("tttStats")) || {X:0,O:0};
    xWinsEl.textContent = s.X;
    oWinsEl.textContent = s.O;
  }

  updateScoreboard();
});
