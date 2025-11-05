const backgroundImage = new Image();
backgroundImage.src = './background.png';
backgroundImage.onload = function () {
    const canvas = document.getElementById('ArkanoidCanvas');
    const context = canvas.getContext('2d');
    const pattern = context.createPattern(backgroundImage, 'repeat');
    context.fillStyle = pattern;
    context.fillRect(0, 0, canvas.width, canvas.height);
}

document.addEventListener("keydown", movement);

function movement(event) {
    if (event.key == "ArrowLeft") {
        moveLeft();
    }
    if (event.key == "ArrowRight") {
        moveRight();
    }
}

window.onload = function(){
    start();
}

function start(){

}