
let boxes = document.querySelectorAll(".box");
let player = document.querySelector(".player");
let time = document.querySelector(".time");
let resetBtn = document.querySelector(".reset");
const winnerMessage = document.getElementById('winner-message');
let gameOverMessage = document.querySelector(".game-over-message");
let humanVsHumanBtn = document.querySelector(".human-vs-human");
let humanVsAiBtn = document.querySelector(".human-vs-ai");
let winningLine = document.querySelector("winning-line");

let turn = "X";
let timer = null;
let timeLeft = 10;
let aiEnabled = false;  
let gameActive = true; 
let gameStarted = false; 


humanVsHumanBtn.addEventListener('click', () => {
    humanVsHumanBtn.classList.add('selected');
    humanVsAiBtn.classList.remove('selected');
    aiEnabled = false;
    startGame();
});

humanVsAiBtn.addEventListener('click', () => {
    humanVsAiBtn.classList.add('selected');
    humanVsHumanBtn.classList.remove('selected');
    aiEnabled = true;
    startGame();
});


function startGame() {
    if (!aiEnabled && !humanVsHumanBtn.classList.contains('selected') || 
        aiEnabled && !humanVsAiBtn.classList.contains('selected')) {
        gameOverMessage.textContent = "Please select 'Human vs Human' or 'Human vs AI' mode!";
        gameOverMessage.classList.remove("hidden");
        setTimeout(() => gameOverMessage.classList.add("hidden"), 3000);
        return;
    }
    
    gameStarted = true;
    resetGame();
    resetTimer();
}

const winPat = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

const checkWin = () => {
    for (let pattern of winPat) {
        let [a, b, c] = pattern;
        if (boxes[a].innerText && boxes[a].innerText === boxes[b].innerText && boxes[a].innerText === boxes[c].innerText) {
            winnerMessage.querySelector('h1').textContent = `Player ${boxes[a].innerText} wins!`;
            winnerMessage.classList.remove('hidden');
            clearInterval(timer);  
            gameActive = false;
            gameStarted = false;
            drawWinningLine(pattern);
            return true;
        }
    }
    return false;
};


const drawWinningLine = (pattern) => {
    const [a, b, c] = pattern;
    if (a % 3 === b % 3 && b % 3 === c % 3) { 
        let column = a % 3;
        winningLine.className = `winning-line absolute bg-red-500 top-0 bottom-0 left-${column}/3 mx-auto w-[10px]`;
    } else if (Math.floor(a / 3) === Math.floor(b / 3) && Math.floor(b / 3) === Math.floor(c / 3)) {
        let row = Math.floor(a / 3);
        winningLine.className = `winning-line absolute bg-red-500 left-0 right-0 my-auto top-${row}/3 h-[10px]`;
    } else if (a === 0 && c === 8) { 
        winningLine.className = `winning-line absolute bg-red-500 left-0 right-0 top-0 bottom-0 transform rotate-45 w-[10px] m-auto h-full`;
    } else { 
        winningLine.className = `winning-line absolute bg-red-500 left-0 right-0 top-0 bottom-0 transform -rotate-45 w-[10px] m-auto h-full`;
    }
    winningLine.style.display = 'block';
};


const checkDraw = () => {
    if (Array.from(boxes).every(box => box.innerText !== "")) {
        winnerMessage.querySelector('h1').textContent = "It's a draw!";
        winnerMessage.classList.remove('hidden');
        clearInterval(timer);
        gameActive = false;
        gameStarted = false;
        return true;
    }
    return false;
};


const aiMove = () => {
    if (!gameActive) return;
    let bestMove = findBestMove("O");
    if (bestMove === null) {
        bestMove = findBestMove("X");
    }
    if (bestMove === null) {
        let emptyBoxes = Array.from(boxes).filter(box => box.textContent === "");
        if (emptyBoxes.length > 0) {
            bestMove = emptyBoxes[Math.floor(Math.random() * emptyBoxes.length)];
        }
    }
    
    if (bestMove) {
        bestMove.textContent = turn;
        if (!checkWin()) {
            checkDraw();
        }
        turn = turn === "X" ? "O" : "X";
        player.textContent = "Player Turn: " + turn;
        
        resetTimer();
    }
};


const findBestMove = (player) => {
    for (let pattern of winPat) {
        let [a, b, c] = pattern;
        let boxesContent = [boxes[a].textContent, boxes[b].textContent, boxes[c].textContent];
        if (boxesContent.filter(content => content === player).length === 2 && 
            boxesContent.includes("")) {

            if (boxes[a].textContent === "") return boxes[a];
            if (boxes[b].textContent === "") return boxes[b];
            if (boxes[c].textContent === "") return boxes[c];
        }
    }
    if (boxes[4].textContent === "") return boxes[4];
    return null;
};


const resetTimer = () => {
    if (!gameStarted) return;
    if (timer) clearInterval(timer);
    timeLeft = 10;
    time.textContent = `Time: ${timeLeft} seconds`;
    timer = setInterval(() => {
        timeLeft--;
        time.textContent = `Time: ${timeLeft} seconds`;
        if (timeLeft === 0) {
            clearInterval(timer);
            if (!Array.from(boxes).some(box => box.textContent !== "")) {
                gameOverMessage.textContent = "Game Over! No moves made.";
            } else {
                gameOverMessage.textContent = "Time's up!";
            }            
            gameOverMessage.classList.remove("hidden");
            setTimeout(() => gameOverMessage.classList.add("hidden"), 3000);           
            turn = turn === "X" ? "O" : "X";
            player.textContent = "Player Turn: " + turn;          
            if (turn === "O" && aiEnabled) {
                setTimeout(aiMove, 1000);
            } else {
                resetTimer();
            }
        }
    }, 1000);
};

boxes.forEach((box) => {
    box.addEventListener("click", () => {
        if (!gameStarted) {
            gameOverMessage.querySelector('h1').textContent = "Please choose a game mode first!";
            gameOverMessage.classList.remove("hidden");
            setTimeout(() => gameOverMessage.classList.add("hidden"), 3000);
            return;
        }

        if (box.textContent === "" && gameActive) {
            box.textContent = turn;
            
            if (checkWin()) {
                return; 
            }          
            if (checkDraw()) {
                return; 
            }
            turn = turn === "X" ? "O" : "X";
            player.textContent = "Player Turn: " + turn;
            resetTimer();

            if (aiEnabled && turn === "O") {
                setTimeout(aiMove, 500); 
            }
        }
    });
});


function resetGame() {
    boxes.forEach((box) => box.textContent = '');
    winnerMessage.classList.add('hidden');
    gameOverMessage.classList.add('hidden');
    player.textContent = "Player Turn: X";
    turn = "X";
    gameActive = true;
    clearInterval(timer);
    timeLeft = 10;
    time.textContent = `Time: ${timeLeft} seconds`;
    winningLine.className = 'winning-line';
    winningLine.style.display = 'none';
    resetTimer();
}


resetBtn.addEventListener('click', resetGame);


window.addEventListener('DOMContentLoaded', () => {
    player.textContent = "Player Turn: X";
    time.textContent = `Time: ${timeLeft} seconds`;

});
