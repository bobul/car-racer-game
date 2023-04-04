const score :Element = document.querySelector('.score')!;
const startScreen :Element = document.querySelector('.startScreen')!;
const gameArea :Element = document.querySelector('.gameArea')!;
const level :Element = document.querySelector('.level')!;
const pause :Element = document.querySelector('.pause')!;
const table :Element = document.createElement('table');
const headingTable :Element = document.createElement('h1');
const divTable :Element = document.createElement('div');

let scores :number[] = JSON.parse(localStorage.getItem('scores')!) || [];

// loading audio files

const gameStart :HTMLAudioElement = new Audio();
const gameOver :HTMLAudioElement = new Audio();

gameStart.src = "./audio/game_theme.mp3";
gameOver.src = "./audio/game_over.mp3";

// Array of images that is used for styling obstacles

const images :string[] = [
    "url('./images/bush.png')",
    "url('./images/fire.png')",
    "url('./images/rock.png')",
    "url('./images/tornado.png')",
    "url('./images/bomb.png')"
]

// Constant for the beginning level speed on different levels
const levelSpeed: {[key: string]: number} = {
    easy: 8,
    moderate: 10,
    difficult: 12
};

// Placeholder (flag) for different arrow keys
const keys: {
    [key: string]: boolean;
} = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
}

let resetSpeed = 0;
interface RoadLineElement extends HTMLDivElement {
    y: number;
}
// Choosing a level
level.addEventListener('click', (e: Event)=> {
    const target = e.target as HTMLDivElement;
    const id = target?.id;
    if(id in levelSpeed){
        player.speed = levelSpeed[id];
        resetSpeed = levelSpeed[id];
    }
    score.classList.remove('hide');
    createResults();

    // Reset a game
    startScreen.addEventListener('click', () => {
        startScreen.classList.add('hide');
        gameArea.innerHTML = "";
    
        player.start = true;
        gameStart.play();
        gameStart.loop = true;
        player.score = 0;
        window.requestAnimationFrame(gamePlay);
    
        for(let i=0; i<5; i++){
            let roadLineElement = document.createElement('div') as RoadLineElement;
            roadLineElement.setAttribute('class', 'roadLines');
            roadLineElement.y = (i*150);
            roadLineElement.style.top = roadLineElement.y + "px";
            gameArea.appendChild(roadLineElement);
        }
    
        let carElement = document.createElement('div');
        carElement.setAttribute('class', 'car');
        gameArea.appendChild(carElement);
    
        player.x = carElement.offsetLeft;
        player.y = carElement.offsetTop ;
    
        for(let i=0; i<3; i++){
            let obstacle = document.createElement('div') as RoadLineElement;
            obstacle.setAttribute('class', 'obstacle');
            obstacle.y = ((i+1) * 350) * - 1;
            obstacle.style.top = obstacle.y + "px";
            obstacle.style.left = Math.floor(Math.random() * 350) + "px";
            obstacle.style.backgroundImage = randomObstacle(images);
            gameArea.appendChild(obstacle);
        }
        // Pause a game
        document.addEventListener('keyup', pauseGame);
    });
});

// An object of pseudo player
let player: {[key:string]:number | boolean} = { speed: resetSpeed, score: 0, start: false };


// A generator of a random obstacle
function randomObstacle(images :string[]){
    return images[Math.floor(Math.random()*images.length)];
}

// Check for collisions between a car and obstacles
function onCollision(a :HTMLDivElement, b :any){
    let aRect = a.getBoundingClientRect();
    let bRect = b.getBoundingClientRect();

    return !((aRect.top >  bRect.bottom) || (aRect.bottom <  bRect.top) ||
        (aRect.right <  bRect.left) || (aRect.left >  bRect.right)); 
}

// Game over 
function onGameOver() {
    document.removeEventListener('keyup',pauseGame);
    player.start = false;
    player.speed = resetSpeed;
    gameStart.pause();
    gameOver.play();
    if (typeof player.score === 'number'){
        scores.push(player.score);
    }
    localStorage.setItem('scores', JSON.stringify(scores));
    startScreen.classList.remove('hide');
    startScreen.innerHTML = "Game Over <br> Your final score is " + player.score + "<br> Press here to restart the game." + `<br><a id="gameOver" href="#tableDiv">See Results</a>`;
    const gameOverRedirect = document.querySelector('#gameOver')!;
    gameOverRedirect.addEventListener('click', (e)=>e.stopPropagation());
    outputResults();
}

// Create a table for results
function createResults(){
    divTable.setAttribute('class', 'tableDiv');
    divTable.setAttribute('id', 'tableDiv');
    document.body.appendChild(divTable);

    
    headingTable.innerHTML = 'Table of Results';
    divTable.appendChild(headingTable);

    divTable.appendChild(table);
}

// Filling the table with results
function outputResults(){
    table.innerHTML = "";
    let gameHeader = document.createElement('th');
    let pointsHeader = document.createElement('th');
    gameHeader.textContent = 'Game';
    pointsHeader.textContent = 'Points';
    let rowData = document.createElement('tr');
    table.appendChild(rowData);
    rowData.appendChild(gameHeader);
    rowData.appendChild(pointsHeader);
    for(let i = 0; i < scores.length; i++){
        let row = document.createElement('tr');
        let gameCell = document.createElement('td');
        let scoreCell = document.createElement('td');
        gameCell.textContent = (i+1).toString();
        scoreCell.textContent = (scores[i]).toString();
        row.appendChild(gameCell);
        row.appendChild(scoreCell);
        table.appendChild(row);
    }
}

// Move a road
function moveRoadLines(){
    let roadLines = document.querySelectorAll('.roadLines') as NodeListOf<RoadLineElement>;
    roadLines.forEach((item)=> {
        if(item.y >= 700){
            item.y -= 750;
        }
        if(typeof player.speed === 'number'){
            item.y += player.speed;
            item.style.top = item.y + "px";
        }
    });
}

// Move obstacles 
function moveObstacles(carElement :HTMLDivElement){
    let obstacles = document.querySelectorAll('.obstacle') as NodeListOf<RoadLineElement>;
    obstacles.forEach((item)=> {

        if(onCollision(carElement, item)){
            onGameOver();
        }
        if(item.y >= 750){
            item.y = -300;
            item.style.left = Math.floor(Math.random() * 350) + "px";
        }
        if (typeof player.speed === 'number') {
            item.y += player.speed;
            item.style.top = item.y + "px";
          }
    });
} 

// Main logic of gameplay
function gamePlay() {
    let carElement = document.querySelector('.car') as HTMLDivElement;
    let road = gameArea.getBoundingClientRect();

    if(player.start){
        divTable.classList.add('hide');
        moveRoadLines();
        moveObstacles(carElement);
        if(typeof player.y === 'number' && typeof player.x === 'number' && typeof player.speed === 'number'){
            if(keys.ArrowUp && player.y > (road.top + 70)) player.y -= player.speed;
            if(keys.ArrowDown && player.y < (road.bottom - 85)) player.y += player.speed ;
            if(keys.ArrowLeft && player.x > 0) player.x -= player.speed;
            if(keys.ArrowRight && player.x < (road.width - 70)) player.x += player.speed;
        }
        carElement.style.top = player.y + "px";
        carElement.style.left = player.x + "px";

        window.requestAnimationFrame(gamePlay);

        if(typeof player.score === 'number'){
            player.score++;
            const ps = player.score -1;
            score.innerHTML = 'Score: ' + ps;
        }
        
        if(typeof player.speed === 'number'){
            if(player.score === parseInt(`${player.score.toString().split('')[0]}000`)){
                player.speed += 1.5;
            }
        }
    }
    else{
        divTable.classList.remove('hide');
    }
    console.log(player.speed);
}

// Keydown listener
document.addEventListener('keydown', (e: KeyboardEvent)=>{
    e.preventDefault();
    keys[e.key] = true;
});

// Keyup listener
document.addEventListener('keyup', (e :KeyboardEvent)=>{
    e.preventDefault();
    keys[e.key] = false;
});

// Pause game
function pauseGame(e:KeyboardEvent){
    e.preventDefault();
    if (e.key === "Escape"){
       player.start = !(player.start);
       gameStart.pause();
       pause.classList.remove('hide');
       if(player.start){
        pause.classList.add('hide');
        gameStart.play();
        gamePlay();
       }
    }
}