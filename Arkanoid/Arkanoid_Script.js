let gameInstance;
let lastFrameTime = 0;
const keyboardEvents = {};

document.addEventListener("keydown", (event) => {
    keyboardEvents[event.code] = true;
});

document.addEventListener("keyup", (event) => {
    keyboardEvents[event.code] = false;
});

class Paddle {
    constructor(areaWidth, areaHeight){
        this.width = 130;
        this.height = 20;
        this.posX = areaWidth/2 - this.width/2;
        this.posY = areaHeight - 50;
        this.moveSpeed = 300;
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

    moveLeft(dt){
        if (this.posX == 0) {
            return;
        }

        if (this.posX - this.moveSpeed * dt < 0) {
            this.posX = 0;
        } else {
            this.posX -= this.moveSpeed * dt;
        }
    }

    moveRight(areaWidth, dt){
        if (this.posX == areaWidth - this.width) {
            return;
        }
        if (this.posX + this.moveSpeed * dt >= areaWidth - this.width){
            this.posX = areaWidth - this.width;
        } else {
            this.posX += this.moveSpeed * dt;
        }
    }
}

class Ball {
    constructor(areaWidth, areaHeight) {
        this.radius = 5;
        this.posX = areaWidth / 2 - this.radius;
        this.posY = areaHeight / 2 - this.radius;
        this.horizontalSpeed = -200;
        this.verticalSpeed = -200;
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
        const xCenterCoord = this.posX + this.radius;
        const yCenterCoord = this.posY + this.radius;
        context.fillStyle = 'white';
        context.beginPath();
        context.arc(xCenterCoord, yCenterCoord, this.radius, 0, Math.PI * 2);
        context.fill();
        context.strokeStyle = 'black';
        context.lineWidth = 1;
        context.stroke();
        context.closePath();
    }

    move(areaWidth, dt) {
        if (this.posX + this.horizontalSpeed * dt > areaWidth - (this.radius * 2)) {
            this.posX = areaWidth - (this.radius * 2);
            this.horizontalBounce();
            return;
        }

        if (this.posX + this.horizontalSpeed * dt < 0) {
            this.posX = 0;
            this.horizontalBounce();
            return;
        }

        if (this.posY + this.verticalSpeed * dt < 0) {
            this.posY = 0;
            this.verticalBounce();
            return;
        }

        this.posX += this.horizontalSpeed * dt;
        this.posY += this.verticalSpeed * dt;
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
        this.brickCount = 0;
        this.isPaused = false;
        this.context.clearRect(0, 0, this.areaWidth, this.areaHeight);
        this.paddle = new Paddle(this.areaWidth, this.areaHeight);
        this.ball = new Ball(this.areaWidth, this.areaHeight);
        this.brickArray = [];
    }
    
    gameLoop(){
        const currentFrameTime = performance.now();
        const deltaTime = (currentFrameTime - lastFrameTime) / 1000;
        lastFrameTime = currentFrameTime;

        this.context.clearRect(0, 0, this.areaWidth, this.areaHeight);
        this.score += 1;

        if (keyboardEvents["ArrowLeft"]) {
            this.movePaddleLeft(deltaTime);
        }
        if (keyboardEvents["ArrowRight"]) {
            this.movePaddleRight(deltaTime);
        }

        this.ball.move(this.areaWidth, deltaTime);
        this.checkAllCollisions();

        this.renderObjects();
        if (!this.isPaused) {
            requestAnimationFrame(this.gameLoop.bind(this));
        }  
    }

    renderObjects() {
        this.paddle.render(this.context);
        this.ball.render(this.context);
        for (const brick of this.brickArray) {
            brick.render(this.context);
        }
    }

    checkAllCollisions(){
        this.checkPaddleCollision(this.ball, this.paddle);
        for (const brick of this.brickArray){
            if (brick.status == BrickStatus.ACTIVE) {
                if (this.checkBrickCollision(this.ball, brick)){
                    break;
                }
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

    movePaddleLeft(dt) {
        this.paddle.moveLeft(dt);
    }

    movePaddleRight(dt) {
        this.paddle.moveRight(this.areaWidth, dt);
    }

    destroyBrick(brick){
        brick.destroy();
        this.brickCount -= 1;
        this.score += 100;
    }

    buildLevel1() {
        // Parametros para tamaño de bloques
        const brickWidth = 56;
        const brickHeight = 30;

        // Que tan arriba empiezan a spawnear bloques
        const levelMargin = (this.gameArea.height / 2) - (brickHeight * 5);

        // Genera la matriz
        for (let i = 0; i < 4; i++) {;
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
                this.brickArray.push(new Brick(brickWidth, brickHeight, brickWidth * j, levelMargin - (brickHeight * i), colorStr));
                this.brickCount += 1;
            }
        }
    }

    checkBrickCollision(ball, brick) {
        // Si hay overlap
        if (ball.posX < brick.posX + brick.width &&
            ball.posX + (ball.radius * 2) > brick.posX &&
            ball.posY < brick.posY + brick.height &&
            ball.posY + (ball.radius * 2) > brick.posY) {

            this.destroyBrick(brick);

            // Coordenadas de los centros de la bola y ladrillo
            const ballHorizontalCenter = ball.posX + ball.radius;
            const ballVerticalCenter = ball.posY + ball.radius;
            const brickHorizontalCenter = brick.posX + (brick.width / 2);
            const brickVerticalCenter = brick.posY + (brick.height / 2);

            // Diferencia de distancias entre centros de la bola y ladrillo
            const xDifference = ballHorizontalCenter - brickHorizontalCenter;
            const yDifference = ballVerticalCenter - brickVerticalCenter;

            // Minima distancia posible sin overlap entre centros
            const xMinDistance = ball.radius + (brick.width / 2);
            const yMinDistance = ball.radius + (brick.height / 2);

            // Distancia o profundidad del overlap
            let xOverlapLength;
            // Bola a la derecha
            if (xDifference > 0) {
                xOverlapLength = xMinDistance - xDifference;
            } else {
                xOverlapLength = -xMinDistance - xDifference;
            }

            let yOverlapLength;
            if (yDifference > 0) {
                yOverlapLength = yMinDistance - yDifference;
            } else {
                yOverlapLength = -yMinDistance - yDifference;
            }

            // por si choca exacto en la esquina
            const bias = 0.1;
            // Rebota en el eje con menos overlap por convencion
            if (Math.abs(xOverlapLength) + bias < Math.abs(yOverlapLength)) {
                ball.horizontalBounce();
                // reboto a la izq del bloque
                if (xOverlapLength > 0) {
                    ball.posX -= xOverlapLength;
                // reboto a la der del bloque
                } else {
                    ball.posX += xOverlapLength;
                }
                return true;
            } else {
                ball.verticalBounce();
                // Reboto arriba
                if (yOverlapLength > 0) {
                    ball.posY -= yOverlapLength;
                // Reboto abajo
                } else {
                    ball.posY += yOverlapLength;
                }
                return true;
            }
        }
        return false;
    }

    checkPaddleCollision(ball, paddle) {
        if (ball.posX < paddle.posX + paddle.width &&
            ball.posX + (ball.radius * 2) > paddle.posX &&
            ball.posY < paddle.posY + paddle.height &&
            ball.posY + (ball.radius * 2) > paddle.posY) {
        
            const ballHorizontalCenter = ball.posX + ball.radius;
            const ballVerticalCenter = ball.posY + ball.radius;
            const paddleHorizontalCenter = paddle.posX + (paddle.width / 2);
            const paddleVerticalCenter = paddle.posY + (paddle.height / 2);

            // Diferencia de distancias entre centros de la bola y ladrillo
            const xDifference = ballHorizontalCenter - paddleHorizontalCenter;
            const yDifference = ballVerticalCenter - paddleVerticalCenter;

            // Minima distancia posible sin overlap entre centros
            const xMinDistance = ball.radius + (paddle.width / 2);
            const yMinDistance = ball.radius + (paddle.height / 2);

            // Distancia o profundidad del overlap
            let xOverlapLength;
            // Bola a la derecha
            if (xDifference > 0) {
                xOverlapLength = xMinDistance - xDifference;
            } else {
                xOverlapLength = -xMinDistance - xDifference;
            }

            let yOverlapLength;
            if (yDifference > 0) {
                yOverlapLength = yMinDistance - yDifference;
            } else {
                yOverlapLength = -yMinDistance - yDifference;
            }

            // Rebota en el eje con menos overlap por convencion
            const bias = 0.1;
            if (Math.abs(xOverlapLength) + bias < Math.abs(yOverlapLength)) {
                ball.horizontalBounce();
                // reboto a la izq de la barra
                if (xOverlapLength > 0) {
                    ball.posX -= xOverlapLength;
                // reboto a la der de la barra
                } else {
                    ball.posX += xOverlapLength;
                }
                return true;
            } else {
                ball.verticalBounce();
                // Reboto arriba
                if (yOverlapLength > 0) {
                    ball.posY -= yOverlapLength;
                }
                return true;
            }
        }
        return false;
    }

    startLevel1(){
        this.buildLevel1();
        this.gameLoop();
    }
}

window.onload = function(){
    const canvas = document.getElementById("ArkanoidCanvas");
    gameInstance = new Game(canvas);
    gameInstance.startLevel1();
}