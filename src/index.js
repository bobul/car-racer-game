"use strict";
const score = document.querySelector('.score');
const startScreen = document.querySelector('.startScreen');
const gameArea = document.querySelector('.gameArea');
const level = document.querySelector('.level');
const pause = document.querySelector('.pause');
const table = document.createElement('table');
const headingTable = document.createElement('h1');
const divTable = document.createElement('div');
let scores = JSON.parse(localStorage.getItem('scores')) || [];
const gameStart = new Audio();
const gameOver = new Audio();
gameStart.src = "./audio/game_theme.mp3";
gameOver.src = "./audio/game_over.mp3";
const images = [
    "url('./images/bush.png')",
    "url('./images/fire.png')",
    "url('./images/rock.png')",
    "url('./images/tornado.png')",
    "url('./images/bomb.png')"
];
const levelSpeed = {
    easy: 8,
    moderate: 10,
    difficult: 12
};
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};
let resetSpeed = 0;
level.addEventListener('click', (e) => {
    const target = e.target;
    const id = target === null || target === void 0 ? void 0 : target.id;
    if (id in levelSpeed) {
        player.speed = levelSpeed[id];
        resetSpeed = levelSpeed[id];
    }
    score.classList.remove('hide');
    createResults();
    startScreen.addEventListener('click', () => {
        startScreen.classList.add('hide');
        gameArea.innerHTML = "";
        player.start = true;
        gameStart.play();
        gameStart.loop = true;
        player.score = 0;
        window.requestAnimationFrame(gamePlay);
        for (let i = 0; i < 5; i++) {
            let roadLineElement = document.createElement('div');
            roadLineElement.setAttribute('class', 'roadLines');
            roadLineElement.y = (i * 150);
            roadLineElement.style.top = roadLineElement.y + "px";
            gameArea.appendChild(roadLineElement);
        }
        let carElement = document.createElement('div');
        carElement.setAttribute('class', 'car');
        gameArea.appendChild(carElement);
        player.x = carElement.offsetLeft;
        player.y = carElement.offsetTop;
        for (let i = 0; i < 3; i++) {
            let obstacle = document.createElement('div');
            obstacle.setAttribute('class', 'obstacle');
            obstacle.y = ((i + 1) * 350) * -1;
            obstacle.style.top = obstacle.y + "px";
            obstacle.style.left = Math.floor(Math.random() * 350) + "px";
            obstacle.style.backgroundImage = randomObstacle(images);
            gameArea.appendChild(obstacle);
        }
        document.addEventListener('keyup', pauseGame);
    });
});
let player = { speed: resetSpeed, score: 0, start: false };
function randomObstacle(images) {
    return images[Math.floor(Math.random() * images.length)];
}
function onCollision(a, b) {
    let aRect = a.getBoundingClientRect();
    let bRect = b.getBoundingClientRect();
    return !((aRect.top > bRect.bottom) || (aRect.bottom < bRect.top) ||
        (aRect.right < bRect.left) || (aRect.left > bRect.right));
}
function onGameOver() {
    document.removeEventListener('keyup', pauseGame);
    player.start = false;
    player.speed = resetSpeed;
    gameStart.pause();
    gameOver.play();
    if (typeof player.score === 'number') {
        scores.push(player.score);
    }
    localStorage.setItem('scores', JSON.stringify(scores));
    startScreen.classList.remove('hide');
    startScreen.innerHTML = "Game Over <br> Your final score is " + player.score + "<br> Press here to restart the game." + `<br><a id="gameOver" href="#tableDiv">See Results</a>`;
    const gameOverRedirect = document.querySelector('#gameOver');
    gameOverRedirect.addEventListener('click', (e) => e.stopPropagation());
    outputResults();
}
function createResults() {
    divTable.setAttribute('class', 'tableDiv');
    divTable.setAttribute('id', 'tableDiv');
    document.body.appendChild(divTable);
    headingTable.innerHTML = 'Table of Results';
    divTable.appendChild(headingTable);
    divTable.appendChild(table);
}
function outputResults() {
    table.innerHTML = "";
    let gameHeader = document.createElement('th');
    let pointsHeader = document.createElement('th');
    gameHeader.textContent = 'Game';
    pointsHeader.textContent = 'Points';
    let rowData = document.createElement('tr');
    table.appendChild(rowData);
    rowData.appendChild(gameHeader);
    rowData.appendChild(pointsHeader);
    for (let i = 0; i < scores.length; i++) {
        let row = document.createElement('tr');
        let gameCell = document.createElement('td');
        let scoreCell = document.createElement('td');
        gameCell.textContent = (i + 1).toString();
        scoreCell.textContent = (scores[i]).toString();
        row.appendChild(gameCell);
        row.appendChild(scoreCell);
        table.appendChild(row);
    }
}
function moveRoadLines() {
    let roadLines = document.querySelectorAll('.roadLines');
    roadLines.forEach((item) => {
        if (item.y >= 700) {
            item.y -= 750;
        }
        if (typeof player.speed === 'number') {
            item.y += player.speed;
            item.style.top = item.y + "px";
        }
    });
}
function moveObstacles(carElement) {
    let obstacles = document.querySelectorAll('.obstacle');
    obstacles.forEach((item) => {
        if (onCollision(carElement, item)) {
            onGameOver();
        }
        if (item.y >= 750) {
            item.y = -300;
            item.style.left = Math.floor(Math.random() * 350) + "px";
        }
        if (typeof player.speed === 'number') {
            item.y += player.speed;
            item.style.top = item.y + "px";
        }
    });
}
function gamePlay() {
    let carElement = document.querySelector('.car');
    let road = gameArea.getBoundingClientRect();
    if (player.start) {
        divTable.classList.add('hide');
        moveRoadLines();
        moveObstacles(carElement);
        if (typeof player.y === 'number' && typeof player.x === 'number' && typeof player.speed === 'number') {
            if (keys.ArrowUp && player.y > (road.top + 70))
                player.y -= player.speed;
            if (keys.ArrowDown && player.y < (road.bottom - 85))
                player.y += player.speed;
            if (keys.ArrowLeft && player.x > 0)
                player.x -= player.speed;
            if (keys.ArrowRight && player.x < (road.width - 70))
                player.x += player.speed;
        }
        carElement.style.top = player.y + "px";
        carElement.style.left = player.x + "px";
        window.requestAnimationFrame(gamePlay);
        if (typeof player.score === 'number') {
            player.score++;
            const ps = player.score - 1;
            score.innerHTML = 'Score: ' + ps;
        }
        if (typeof player.speed === 'number') {
            if (player.score === parseInt(`${player.score.toString().split('')[0]}000`)) {
                player.speed += 1.5;
            }
        }
    }
    else {
        divTable.classList.remove('hide');
    }
    console.log(player.speed);
}
document.addEventListener('keydown', (e) => {
    e.preventDefault();
    keys[e.key] = true;
});
document.addEventListener('keyup', (e) => {
    e.preventDefault();
    keys[e.key] = false;
});
function pauseGame(e) {
    e.preventDefault();
    if (e.key === "Escape") {
        player.start = !(player.start);
        gameStart.pause();
        pause.classList.remove('hide');
        if (player.start) {
            pause.classList.add('hide');
            gameStart.play();
            gamePlay();
        }
    }
}
//# sourceMappingURL=index.js.map