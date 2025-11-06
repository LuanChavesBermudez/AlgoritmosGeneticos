const keyboardEvents = {};

document.addEventListener("keydown", (event) => {
    keyboardEvents[event.code] = true;
});

document.addEventListener("keyup", (event) => {
    keyboardEvents[event.code] = false;
});

class Paddle {
    constructor(areaWidth, areaHeight){
        this.width = 150;
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

class Brick {}

class Game {
    constructor(gameArea) {
        this.gameArea = gameArea;
        this.context = gameArea.getContext("2d");
        this.paddle = new Paddle(gameArea.width, gameArea.height);
    }
    
    gameLoop(){
        this.context.clearRect(0, 0, this.gameArea.width, this.gameArea.height);

        if (keyboardEvents["ArrowLeft"]) {
            this.movePaddleLeft();
        }
        if (keyboardEvents["ArrowRight"]) {
            this.movePaddleRight();
        }

        this.renderObjects();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    renderObjects() {
        this.paddle.render(this.context);
    }

    movePaddleLeft() {
        this.paddle.moveLeft();
    }

    movePaddleRight() {
        this.paddle.moveRight(this.gameArea.width);
    }
}

window.onload = function(){
    const canvas = document.getElementById("ArkanoidCanvas");
    gameInstance = new Game(canvas);
    gameInstance.gameLoop();
}