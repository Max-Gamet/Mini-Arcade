const board = document.getElementById("gameBoard");
const movesEl = document.getElementById("moves");
const restartBtn = document.getElementById("restart");

const emojis = ["🍎","🍌","🍇","🍒","🍓","🥝","🍍","🍉"];
let cards = [...emojis, ...emojis];

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;

let bestScore = Number(localStorage.getItem("memoryBestScore")) || null;
let lastScore = Number(localStorage.getItem("memoryLastScore")) || null;

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function createBoard() {
    board.innerHTML = "";
    shuffle(cards);

    cards.forEach(emoji => {
        const card = document.createElement("div");
        card.className = "card";
        card.dataset.emoji = emoji;
        card.textContent = "";

        card.addEventListener("click", () => flipCard(card));
        board.appendChild(card);
    });

    moves = 0;
}

function flipCard(card) {
    if (lockBoard) return;
    if (card === firstCard) return;
    if (card.classList.contains("matched")) return;

    card.classList.add("flipped");
    card.textContent = card.dataset.emoji;

    if (!firstCard) {
        firstCard = card;
        return;
    }

    secondCard = card;
    lockBoard = true;
    moves++,
    updateScoreUI();

    checkMatch();
}

function checkMatch() {
    const isMatch = 
        firstCard.dataset.emoji === secondCard.dataset.emoji;

    if (isMatch) {
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");

        resetTurn();

        if (document.querySelectorAll(".card.matched").length === cards.length) {
            setTimeout(handleWin, 400);
        }
    } else {
        setTimeout(() => {
            firstCard.classList.remove("flipped");
            secondCard.classList.remove("flipped");
            firstCard.textContent = "";
            secondCard.textContent = "";
            resetTurn();
        }, 700);
    }
}

function handleWin() {
    lastScore = moves;
    localStorage.setItem("memoryLastScore", lastScore);

    const highScorePopup = document.getElementById("highScorePopup");

    let isNewHighScore = false;

    if (bestScore === null || moves < bestScore) {
        bestScore = moves;
        localStorage.setItem("memoryBestScore", bestScore);
        isNewHighScore = true;
    }

    updateScoreUI();

    board.classList.add("win-glow");

    setTimeout(() => {
        board.classList.remove("win-glow")
    }, 2000);

    const popup = document.getElementById("winPopup");
    popup.classList.add("show");

    setTimeout(() => {
        popup.classList.remove("show")
    }, 1500);

    if (isNewHighScore) {
        highScorePopup.classList.remove("hidden");
        highScorePopup.classList.add("show");

        launchConfetti();

        setTimeout(() => {
            highScorePopup.classList.remove("show");
            
            setTimeout(() => {
                highScorePopup.classList.add("hidden");
            }, 400);
        }, 2000);
    }
}

function resetTurn() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
}

function updateScoreUI() {
    movesEl.textContent = moves;

  document.getElementById("currentMoves").textContent = moves;
  document.getElementById("lastMoves").textContent =
    lastScore !== null ? lastScore : "--";
  document.getElementById("bestMoves").textContent =
    bestScore !== null ? bestScore : "--";
}

restartBtn.addEventListener("click", () => {
    lockBoard = false;
    firstCard = null;
    secondCard = null;
    moves = 0;
    movesEl.textContent = 0;

    document.getElementById("currentMoves").textContent = 0;

    const highScorePopup = document.getElementById("highScorePopup");
    highScorePopup.classList.remove("show");
    highScorePopup.classList.add("hidden");

    createBoard();
});

function launchConfetti() {
    for (let i = 0; i < 40; i++) {
        const c = document.createElement("div");
        c.className = "confetti";
        c.style.left = Math.random() * window.innerWidth + "px";
        c.style.background = Math.random() > 0.5 ? "#facc15" : "#22d3ee";
        document.body.appendChild(c);

        setTimeout(() => c.remove(), 2500);
    }
}

createBoard();
updateScoreUI();
