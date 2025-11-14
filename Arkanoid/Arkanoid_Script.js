let gameInstance;
let lastFrameTime = 0;
const keyboardEvents = {};

document.addEventListener("keydown", (event) => {
    keyboardEvents[event.code] = true;
});
document.addEventListener("keyup", (event) => {
    keyboardEvents[event.code] = false;
});

const paddleDirection = {
    NEUTRAL: 0,
    LEFT: -1,
    RIGHT: 1
}

class Paddle {
    constructor(areaWidth, areaHeight){
        this.width = 130;
        this.height = 20;
        this.posX = areaWidth/2 - this.width/2;
        this.posY = areaHeight - 50;
        this.moveSpeed = 300;
        this.direction = paddleDirection.NEUTRAL;
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

    move(areaWidth, dt) {
        const movement = this.moveSpeed * this.direction;
        if (this.posX + movement * dt < 0) {
            this.posX = 0;
            return;
        }
        if (this.posX + movement * dt >= areaWidth - this.width){
            this.posX = areaWidth - this.width;
            return;
        }
        this.posX += movement * dt;
    }
}

const BallStatus = {
    ACTIVE: true,
    DESTROYED: false
}

class Ball {
    constructor(areaWidth, areaHeight) {
        this.radius = 5;
        this.posX = areaWidth / 2 - this.radius;
        this.posY = areaHeight / 2 - this.radius;
        this.horizontalSpeed = 0;
        this.verticalSpeed = 200;
        this.status = BallStatus.ACTIVE;
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
        if (this.status) {
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

    isActive(){
        return this.status;
    }

    destroy(){
        this.status = BallStatus.DESTROYED;
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

    isActive(){
        return this.status;
    }
}

const PowerUpStatus = {
    ACTIVE: true,
    DESTROYED: false
}

const PowerUpType = {
    TRIPLE: 1
}

class PowerUp {
    constructor(type, posX, posY) {
        this.width = 20;
        this.height = 10;
        this.posX = posX;
        this.posY = posY;
        this.type = type;
        this.status = PowerUpStatus.ACTIVE;
        this.fallSpeed = 200;
    }

    render(context) {
        if (this.status) {
            const color = this.pickColor();
            context.fillStyle = color;
            context.strokeStyle = 'yellow';
            context.lineWidth = 1;
            context.beginPath();
            context.roundRect(this.posX, this.posY, this.width, this.height, 6);
            context.stroke();
            context.fill()    
        }
    }

    pickColor(){
        switch (this.type) {
            case PowerUpType.TRIPLE:
                color = 'pink';
                break;
            default:
                color = 'white';
                break;
        }
    }

    move(areaHeight, dt) {
        return;
    }

    destroy(){
        this.status = PowerUpStatus.DESTROYED;
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
        this.isRunning = true;
        this.isPaused = false;
        this.score = 0;
        this.brickArray = [];
        this.brickCount = 0;
        this.ballArray = [];
        this.ballArray.push(new Ball(this.areaWidth, this.areaHeight))
        this.ballCount = 1;
        this.paddle = new Paddle(this.areaWidth, this.areaHeight);
        
        this.context.clearRect(0, 0, this.areaWidth, this.areaHeight); 
    }
    
    gameLoop(){
        const currentFrameTime = performance.now();
        const deltaTime = (currentFrameTime - lastFrameTime) / 1000;
        lastFrameTime = currentFrameTime;

        let movementDirection = paddleDirection.NEUTRAL;

        if (keyboardEvents["ArrowLeft"]) {
            movementDirection = paddleDirection.LEFT;
        }
        if (keyboardEvents["ArrowRight"]) {
            movementDirection = paddleDirection.RIGHT;
        }

        this.progress(movementDirection, deltaTime);
        this.render();
        if (this.isRunning) {
            requestAnimationFrame(this.gameLoop.bind(this));
        }  
    }

    progress(paddleDirection, dt){
        this.paddle.direction = paddleDirection;
        this.paddle.move(this.areaWidth, dt);
        this.brickBroken = false;
        this.substepMoveAndCollide(dt);

        if (this.ballCount == 0) {
            this.isRunning = false;
            return this.score;
        }

        if(this.brickCount == 0) {
            this.score += 1000;
            this.isRunning = false;
            return this.score;
        }
    }


    render() {
        this.context.clearRect(0, 0, this.areaWidth, this.areaHeight);
        this.paddle.render(this.context);
        for (const ball of this.ballArray) {
            ball.render(this.context);
        }
        for (const brick of this.brickArray) {
            brick.render(this.context);
        }
    }

    substepMoveAndCollide(dt){
        if (this.brickBroken) return;
        const substeps = 3;
        //para cada bola
        for (let ball of this.ballArray){
            //si está activa
            if (ball.isActive()) {
                if (ball.posY > this.areaHeight) {
                    this.ballDestroyed(ball);
                    continue;
                }
                //en base a los substeps
                for (let step = 0; step < substeps; step++) {
                    //checkea colisiones y las resuelve antes de mover la bola
                    for (let brick of this.brickArray){
                        if (brick.isActive()) {
                            if (this.checkBrickCollision(ball, brick)){
                                this.brickBroken = true;
                                return;
                            }
                        }
                    }
                    ball.move(this.areaWidth, dt / substeps);
                    this.checkPaddleCollision(ball, this.paddle);
                }
            }
        }
    }

    buildLevel1() {
        // Parametros para tamaño de bloques
        const brickWidth = 56;
        const brickHeight = 30;

        // Que tan arriba empiezan a spawnear bloques
        const levelMargin = brickHeight * 6;

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
            }
        }
        this.brickCount = this.brickArray.length;
    }

    ballDestroyed(ball){
        ball.destroy();
        this.ballCount -= 1;
        this.score -= 500;    
    }

    brickDestroyed(brick) {
        brick.destroy();
        this.brickCount -= 1;
        this.score += 100; 
    }

    checkBrickCollision(ball, brick) {
        // Si hay overlap
        if (ball.posX < brick.posX + brick.width &&
            ball.posX + (ball.radius * 2) > brick.posX &&
            ball.posY < brick.posY + brick.height &&
            ball.posY + (ball.radius * 2) > brick.posY) {

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
                const spacing = 5;
                // reboto a la izq del bloque
                if (xOverlapLength > 0) {
                    ball.posX -= xOverlapLength - spacing;
                // reboto a la der del bloque
                } else {
                    ball.posX += xOverlapLength + spacing;
                }
            } else {
                ball.verticalBounce();
                const spacing = 10;
                // Reboto arriba
                if (yOverlapLength > 0) {
                    ball.posY -= yOverlapLength - spacing;
                // Reboto abajo
                } else {
                    ball.posY += yOverlapLength + spacing;
                }
            }
            this.brickDestroyed(brick);
            return true;
        }
        return false;
    }

    checkPaddleCollision(ball, paddle) {
        if (ball.posX < paddle.posX + paddle.width &&
            ball.posX + (ball.radius * 2) > paddle.posX &&
            ball.posY < paddle.posY + paddle.height &&
            ball.posY + (ball.radius * 2) > paddle.posY &&
            ball.verticalSpeed > 0) {
        
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
                this.bouncePhysics(ball, paddle, xDifference);
            } else {
                ball.verticalBounce();
                // Reboto arriba
                if (yOverlapLength > 0) {
                    ball.posY -= yOverlapLength;
                // Para evitar que la bola se quede pegada dentro
                } else {
                    ball.posY += yOverlapLength;
                }

                this.bouncePhysics(ball, paddle);
            }
            return true;
        }
        return false;
    }

    startLevel1(){
        this.buildLevel1();
        this.gameLoop();
    }

    bouncePhysics(ball, paddle){
        const maxSpeed = 400;
        let paddleInfluence = paddle.moveSpeed * paddle.direction * 0.7;

        if (paddle.posX == 0 || paddle.posX + paddle.width == this.areaWidth) {
            paddleInfluence = 0;
        }

        let relativeDistanceRatio = ((ball.posX + ball.radius) - paddle.posX) / paddle.width;
        relativeDistanceRatio = Math.max(0, Math.min(1, relativeDistanceRatio));     
        if(paddle.direction == paddleDirection.LEFT) {
            relativeDistanceRatio = 1 - relativeDistanceRatio;
        }
        
        let newHorizontalSpeed = ball.horizontalSpeed + paddleInfluence * relativeDistanceRatio;
        newHorizontalSpeed = Math.max(-maxSpeed, Math.min(maxSpeed, newHorizontalSpeed));
        ball.horizontalSpeed = newHorizontalSpeed;
    }

    gameState() {
        let ballCoords = [];
        let ballMovement = [];
        for (let ball of this.ballArray) {
            ballCoords.push([ball.posX, ball.posY]);
            ballMovement.push([ball.horizontalSpeed, ball.verticalSpeed]);
        }
        const state = {
            paddleXCoord: this.paddle.posX,
            paddleYCoord: this.paddle.posY,
            ballsCoords: ballCoords,
            ballsVectors: ballMovement
        }
        return state;
    }
}

window.onload = function(){
    const canvas = document.getElementById("ArkanoidCanvas");
    gameInstance = new Game(canvas);
    gameInstance.startLevel1();
}