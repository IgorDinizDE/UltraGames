const cells = document.querySelectorAll('.cell');
const resetButton = document.getElementById('reset-button');
const resetScoreButton = document.getElementById('reset-score-button');
const playerChoice = document.getElementById('player-choice');
const difficultySelect = document.getElementById('difficulty');
const themeChoice = document.getElementById('theme-choice');
const scoreX = document.getElementById('scoreX');
const scoreO = document.getElementById('scoreO');
const historyList = document.getElementById('history-list');

let currentPlayer = 'X';
let board = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let playerSymbol = 'X';
let computerSymbol = 'O';
let difficulty = 'easy';
let score = { X: 0, O: 0 };
let history = [];

// Carregar os sons
const moveSound = new Audio('sounds/move.mp3');
const winSound = new Audio('sounds/win.mp3');
const resetSound = new Audio('sounds/reset.mp3');

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (board[clickedCellIndex] !== '' || !gameActive || currentPlayer !== playerSymbol) {
        return;
    }

    playMove(clickedCellIndex, playerSymbol);
    moveSound.play();

    if (gameActive) {
        currentPlayer = computerSymbol;
        setTimeout(() => {
            computerMove();
            currentPlayer = playerSymbol;
        }, 500);
    }
}

function playMove(index, symbol) {
    board[index] = symbol;
    const cell = document.querySelector(`.cell[data-index="${index}"]`);
    cell.textContent = symbol;
    cell.style.backgroundColor = symbol === playerSymbol ? '#00ff00' : '#ff0000';

    if (checkWin(symbol)) {
        highlightWinningCells(symbol);
        updateScore(symbol);
        addHistory(symbol);
        winSound.play();
        setTimeout(() => alert(`${symbol} ganhou!`), 100);  // Pequeno atraso para que o som toque antes do alerta
        gameActive = false;
    } else if (board.every(cell => cell !== '')) {
        winSound.play();
        setTimeout(() => alert('Empate!'), 100);  // Pequeno atraso para que o som toque antes do alerta
        gameActive = false;
    }
}

function checkWin(symbol) {
    return winningConditions.some(condition => {
        return condition.every(index => board[index] === symbol);
    });
}

function highlightWinningCells(symbol) {
    winningConditions.forEach(condition => {
        if (condition.every(index => board[index] === symbol)) {
            condition.forEach(index => {
                const cell = document.querySelector(`.cell[data-index="${index}"]`);
                cell.classList.add('win');
            });
        }
    });
}

function updateScore(symbol) {
    score[symbol]++;
    scoreX.textContent = score.X;
    scoreO.textContent = score.O;
}

function addHistory(symbol) {
    const listItem = document.createElement('li');
    listItem.textContent = `${symbol} ganhou a partida ${history.length + 1}`;
    historyList.appendChild(listItem);
    history.push({ winner: symbol, board: [...board] });
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    cells.forEach(cell => {
        cell.textContent = '';
        cell.style.backgroundColor = 'white';
        cell.classList.remove('win');
    });
    currentPlayer = playerSymbol;
    gameActive = true;
    resetSound.play();
}

function resetScore() {
    score = { X: 0, O: 0 };
    scoreX.textContent = score.X;
    scoreO.textContent = score.O;
    history = [];
    historyList.innerHTML = '';
}

function updatePlayerChoice() {
    playerSymbol = playerChoice.value;
    computerSymbol = playerSymbol === 'X' ? 'O' : 'X';
    resetGame();
}

function updateDifficulty() {
    difficulty = difficultySelect.value;
}

function updateTheme() {
    const theme = themeChoice.value;
    document.body.className = theme;
}

function computerMove() {
    let move;

    if (difficulty === 'easy') {
        move = getRandomMove();
    } else if (difficulty === 'medium') {
        move = getBlockingMove();
        if (move === null) {
            move = getRandomMove();
        }
    } else if (difficulty === 'hard') {
        move = getBestMove();
    }

    if (move !== null) {
        playMove(move, computerSymbol);
        moveSound.play();
    }
}

function getRandomMove() {
    const emptyCells = board.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function getBlockingMove() {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (board[a] === playerSymbol && board[b] === playerSymbol && board[c] === '') return c;
        if (board[a] === playerSymbol && board[b] === '' && board[c] === playerSymbol) return b;
        if (board[a] === '' && board[b] === playerSymbol && board[c] === playerSymbol) return a;
    }
    return null;
}

function getBestMove() {
    let bestMove = -1;
    let bestValue = -Infinity;

    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            board[i] = computerSymbol;
            let moveValue = minimax(board, 0, false);
            board[i] = '';

            if (moveValue > bestValue) {
                bestMove = i;
                bestValue = moveValue;
            }
        }
    }

    return bestMove;
}

function minimax(newBoard, depth, isMaximizing) {
    if (checkWin(computerSymbol)) return 10 - depth;
    if (checkWin(playerSymbol)) return depth - 10;
    if (newBoard.every(cell => cell !== '')) return 0;

    if (isMaximizing) {
        let best = -Infinity;
        for (let i = 0; i < newBoard.length; i++) {
            if (newBoard[i] === '') {
                newBoard[i] = computerSymbol;
                best = Math.max(best, minimax(newBoard, depth + 1, false));
                newBoard[i] = '';
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < newBoard.length; i++) {
            if (newBoard[i] === '') {
                newBoard[i] = playerSymbol;
                best = Math.min(best, minimax(newBoard, depth + 1, true));
                newBoard[i] = '';
            }
        }
        return best;
    }
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', resetGame);
resetScoreButton.addEventListener('click', resetScore);
playerChoice.addEventListener('change', updatePlayerChoice);
difficultySelect.addEventListener('change', updateDifficulty);
themeChoice.addEventListener('change', updateTheme);

console.log('Script loaded successfully');
