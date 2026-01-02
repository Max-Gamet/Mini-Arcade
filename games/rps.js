const buttons = document.querySelectorAll("#choices button");
const resultEl = document.getElementById("result");
const playerScoreEl = document.getElementById("playerScore");
const aiScoreEl = document.getElementById("aiScore");
const emojiMap = {
    rock: "🪨",
    paper: "📄",
    scissors: "✂️"
};
const aiChoiceEl = document.getElementById("aiChoice");
const loadingEmojis = ["🤜", "🤛"]
let loadingInterval = null;

let playerScore = Number(localStorage.getItem("rpsPlayerWins")) || 0;
let aiScore = Number(localStorage.getItem("rpsAIWins")) || 0;

let gameMode = localStorage.getItem("rpsGameMode") || "free";
let maxWins = gameMode === "3" ? 2 : gameMode === "5" ? 3 : Infinity;
let gameOver = false;

playerScoreEl.textContent = playerScore;
aiChoiceEl.textContent = "AI chose: ?";
aiScoreEl.textContent = aiScore;

const choices = ["rock", "paper", "scissors"];

buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        if (gameOver) return;
        const playerChoice = btn.dataset.choice;

        aiChoiceEl.classList.add("ai-thinking");
        aiChoiceEl.textContent = "🤜 🤛";

        setTimeout(() => {
            const aiChoice = choices[Math.floor(Math.random() * 3)];

            aiChoiceEl.classList.remove("ai-thinking");

            playRound(playerChoice, aiChoice);
        }, 2000);
    });
});

document.querySelectorAll("#gameModes button").forEach(btn => {
    btn.addEventListener("click", () => {
        gameMode = btn.dataset.mode;
        localStorage.setItem("rpsGameMode", gameMode);

        maxWins = 
            gameMode === "3" ? 2 :
            gameMode === "5" ? 3 :
            Infinity;

        resetMatch();
    })
})

function resetMatch() {
    playerScore = 0;
    aiScore = 0;
    gameOver = false;

    localStorage.setItem("rpsPlayerWins", 0);
    localStorage.setItem("rpsAIWins", 0);

    playerScoreEl.textContent = 0;
    aiScoreEl.textContent = 0;
    aiChoiceEl.textContent = "Ai choice: ?";
    resultEl.textContent = 
        gameMode === "free"
            ? "Free Play Mode"
            : `Best of ${gameMode}`;
}

function launchConfetti() {
    for (let i = 0; i < 50; i++) {
        const conf = document.createElement("div");
        conf.className = "confetti";
        conf.style.left = Math.random() * 100 + "vw";
        conf.style.background = Math.random() > 0.5 ? "cyan" : "lime";

        document.getElementById("confetti").appendChild(conf);

        setTimeout(() => conf.remove(), 2000);
    }
}

function startAiLoading(playerChoice) {
    resultEl.textContent = "";
    aiChoiceEl.textContent = "Ai is choosing..."

    let index = 0

    loadingInterval = setInterval(() => {
        aiChoiceEl.textContent = `AI chose: ${loadingEmojis[index % 2]}`;
        index++;
    }, 300);

    setTimeout(() => {
        clearInterval(loadingInterval);

        const aiChoice = choices[Math.floor(Math.random() * 3)];
        playRound(playerChoice, aiChoice);
    }, 2000);
}

function playRound(player, ai) {
    aiChoiceEl.textContent = `AI chose: ${emojiMap[ai]}`;
    
    if (player === ai) {
        resultEl.textContent = `Draw: Both chose ${player}`;
        return;
    }

    const win =
        (player === "rock" && ai === "scissors") ||
        (player === "paper" && ai === "rock") ||
        (player === "scissors" && ai === "paper");

    if (win) {
        playerScore++;
        localStorage.setItem("rpsPlayerWins", playerScore);
        playerScoreEl.textContent = playerScore;
        resultEl.textContent = `You Win: ${player} beats ${ai}`;
    } else {
        aiScore++;
        localStorage.setItem("rpsAIWins", aiScore);
        aiScoreEl.textContent = aiScore;
        resultEl.textContent = `You lose! ${ai} beats ${player}`;
    }

    if (playerScore >= maxWins || aiScore >= maxWins) {
        if (gameMode !== "free") {
            gameOver = true;
            launchConfetti();

            resultEl.textContent =
                playerScore >= maxWins
                    ? "🔥 YOU WON THE MATCH!"
                    : "💀 AI WON THE MATCH!";
        }
    }
}

window.addEventListener("load", () => {
    aiChoiceEl.textContent = "AI chose: ?"
})