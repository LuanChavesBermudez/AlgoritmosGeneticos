let gameInstance;
const keyboardEvents = {};

document.addEventListener("keydown", (event) => {
    keyboardEvents[event.code] = true;
});

document.addEventListener("keyup", (event) => {
    keyboardEvents[event.code] = false;
});

class Paddle {
    constructor(areaWidth, areaHeight){
        this.width = 125;
        this.height = 20;
        this.posX = areaWidth/2 - this.width/2;
        this.posY = areaHeight - 50;
        this.moveSpeed = 8;
    }

    render(context) {
        const gradient = context.createLinearGradient(this.posX, 0, this.posX + this.width, 0);
        gradient.addColorStop(0, "#760000ff");
        gradient.addColorStop(0.14, "#a00000ff");
        gradient.addColorStop(0.15, "#000000ff");
        gradient.addColorStop(0.16, "#999999ff");
        gradient.addColorStop(0.84, "#999999ff");
        gradient.addColorStop(0.85, "#000000ff");
        gradient.addColorStop(0.86, "#a00000ff");
        gradient.addColorStop(1, "#760000ff");
        context.fillStyle = gradient;
        context.beginPath();
        context.roundRect(this.posX, this.posY, this.width, this.height, 6);
        context.fill();
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.stroke();
        context.closePath();
    }

    moveLeft(){
        if (this.posX == 0) {
            return;
        }

        if (this.posX - this.moveSpeed < 0) {
            this.posX = 0;
        } else {
            this.posX -= this.moveSpeed;
        }
    }

    moveRight(areaWidth){
        if (this.posX == areaWidth - this.width) {
            return;
        }
        if (this.posX + this.moveSpeed >= areaWidth - this.width){
            this.posX = areaWidth - this.width;
        } else {
            this.posX += this.moveSpeed;
        }
    }
}

class Ball {
    constructor(areaWidth, areaHeight) {
        this.radius = 6;
        this.posX = areaWidth / 2 - this.radius;
        this.posY = areaHeight / 2;
        this.horizontalSpeed = -6;
        this.verticalSpeed = -6; 
    }

    /*
    constructor(posX, posY, horizontalSpeed, verticalSpeed) {
        this.radius = 10;
        this.posX = posX;
        this.posY = posY;
        this.horizontalSpeed = horizontalSpeed;
        this.verticalSpeed = verticalSpeed; 
    }
    */

    render(context) {
        context.fillStyle = 'white';
        context.beginPath();
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2);
        context.fill();
        context.strokeStyle = 'black';
        context.lineWidth = 1;
        context.stroke();
        context.closePath();
    }

    move(areaWidth) {
        if (this.posX == 0 || this.posX == areaWidth - this.radius) {
            this.horizontalBounce();
        }
        if (this.posY == 0) {
            this.verticalBounce();
        }

        if (this.posX + this.horizontalSpeed > areaWidth - this.radius) {
            this.posX = areaWidth - this.radius;
            return;
        }

        if (this.posX + this.horizontalSpeed < 0) {
            this.posX = 0;
            return;
        }

        if (this.posY + this.verticalSpeed < 0) {
            this.posY = 0;
            return;
        }

        this.posX += this.horizontalSpeed;
        this.posY += this.verticalSpeed;
    }

    horizontalBounce() {
        this.horizontalSpeed *= -1;
    }

    verticalBounce() {
        this.verticalSpeed *= -1;
    }
}

const BrickStatus = {
    ACTIVE: true,
    DESTROYED: false
}

class Brick {
    constructor(width, height, posX, posY, colorStr) {
        this.width = width;
        this.height = height;
        this.posX = posX;
        this.posY = posY;
        this.colorStr = colorStr;
        this.status = BrickStatus.ACTIVE;
    }

    render(context) {
        if (this.status) {
            context.fillStyle = this.colorStr;
            context.fillRect(this.posX, this.posY, this.width, this.height);
            context.strokeStyle = "black";
            context.lineWidth = 1;
            context.strokeRect(this.posX, this.posY, this.width, this.height);
        }
    }

    destroy() {
        this.status = BrickStatus.DESTROYED;
    }
}

class Game {
    constructor(gameArea) {
        this.gameArea = gameArea;
        this.areaWidth = gameArea.width;
        this.areaHeight = gameArea.height;
        this.context = gameArea.getContext("2d");
        this.initializeLogic();
    }

    initializeLogic() {
        this.score = 0;
        this.isPaused = false;
        this.context.clearRect(0, 0, this.areaWidth, this.areaHeight);
        this.paddle = new Paddle(this.areaWidth, this.areaHeight);
        this.ball = new Ball(this.areaWidth, this.areaHeight);
        this.brickMatrix = [];
    }
    
    gameLoop(){
        this.context.clearRect(0, 0, this.areaWidth, this.areaHeight);
        this.score += 1;

        if (keyboardEvents["ArrowLeft"]) {
            this.movePaddleLeft();
        }
        if (keyboardEvents["ArrowRight"]) {
            this.movePaddleRight();
        }
        this.ball.move(this.areaWidth);

        this.renderObjects();
        if (!this.isPaused) {
            requestAnimationFrame(this.gameLoop.bind(this));
        }  
    }

    renderObjects() {
        this.paddle.render(this.context);
        this.ball.render(this.context);
        for (const row of this.brickMatrix){
            for (const brick of row) {
                brick.render(this.context);
            }
        }
    }

    togglePause(){
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            cancelAnimationFrame(this.gameLoop);
        } else {
            this.gameLoop();
        }
    }

    stop(){
        this.isPaused = true;
        cancelAnimationFrame(this.gameLoop);
    }

    restart() {
        this.stop();
        this.initializeLogic();
    }

    movePaddleLeft() {
        this.paddle.moveLeft();
    }

    movePaddleRight() {
        this.paddle.moveRight(this.gameArea.width);
    }

    buildLevel1() {
        const brickWidth = 56;
        const brickHeight = 25;
        const levelMargin = (this.gameArea.height / 2) - (brickHeight * 5);
        for (let i = 0; i < 4; i++) {
            this.brickMatrix[i] = [];
            for (let j = 0; j < 12; j++) {
                let colorStr = "white";
                
                switch (i) {
                    case 0:
                        colorStr = "skyblue";
                        break;
                    case 1:
                        colorStr = "red";
                        break;
                    case 2:
                        colorStr = "yellow";
                        break;
                    default:
                        colorStr = "green";
                }
                this.brickMatrix[i][j] = new Brick(brickWidth, brickHeight, brickWidth * j, levelMargin - (brickHeight * i), colorStr);
            }
        }
    }
}

window.onload = function(){
    const canvas = document.getElementById("ArkanoidCanvas");
    gameInstance = new Game(canvas);
    gameInstance.buildLevel1();
    gameInstance.gameLoop();
}