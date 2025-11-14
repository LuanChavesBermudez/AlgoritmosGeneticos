const canvas = document.getElementById('ArkanoidCanvas');

const paddleDirection = {
    NEUTRAL: 0,
    LEFT: -1,
    RIGHT: 1
}

class Individual {
    constructor(){
        this.fitness = 0;
        this.policy = {};
    }

    act(state) {

    }

    evaluate() {
        let evaluationScore = 0;
        const deltatime = 1/60;
        let framecount = 0;
        const invisibleCanvas = canvas.transferControlToOffscreen();
        const instance = new Game(invisibleCanvas);

        while (instance.isRunning) {
            const state = instance.gameState();

            const action = act(state);

            instance.progress(action, deltatime);
            instance.render();
            evaluationScore -= 0.1;
            framecount += 1;
        }

        evaluationScore += instance.score;
        return evaluationScore;
    }

    
}

class Population {
    constructor(populationSize){
        this.populationSize = populationSize;

    }

    fitness(){
        
    }

    selection(){

    }

    crossover(){

    }

    mutation(){

    }
}