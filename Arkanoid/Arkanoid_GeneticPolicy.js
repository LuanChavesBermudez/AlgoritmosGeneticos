import {Arkanoid} from "./Arkanoid_Script.js";

const canvas = document.getElementById('ArkanoidCanvas');
let POPULATION_SIZE;
let GENERATIONS;


class Individual {
    constructor(chromosome){
        this.fitness = 0;
        this.policy = {
            NEUTRAL: 0,
            LEFT: -1,
            RIGHT: 1
        };
        this.chromosome = chromosome;
    }

    act(state) {
        const indecision = 0.1;
        let closestBall = null;
        for (let ball of state["BallStates"]) {
            if(!closestBall || ball["yCoord"] > closestBall["yCoord"]) {
                closestBall = ball;
            }
        }
        const paddle = state["PaddleState"];

        const decisionScore = (
            closestBall["xCoord"] * this.chromosome["ballXWeight"] +
            closestBall["yCoord"] * this.chromosome["ballYWeight"] +
            closestBall["horSpeed"] * this.chromosome["horSpeedWeight"] +
            closestBall["verSpeed"] * this.chromosome["verSpeedWeight"] +
            paddle["xCoord"] * this.chromosome["paddleXWeight"] +
            this.chromosome["individualBias"]
        );

        if (decisionScore < -indecision) {
            return this.policy.LEFT;
        }
        if (decisionScore > indecision) {
            return this.policy.RIGHT;
        }
        return this.policy.NEUTRAL;
    }

    evaluate(gameInstance) {
        let evaluationScore = 0;
        const deltatime = 1/60;
        while (gameInstance.isRunning) {
            const state = gameInstance.getState();
            const action = act(state);

            gameInstance.progress(action, deltatime);
            evaluationScore -= 0.1;
        }

        evaluationScore += gameInstance.score;
        this.fitness = evaluationScore;
    } 

    mutate() {
        const keys = Object.keys(this.chromosome);
        const randomIndex = Math.floor(Math.random() * keys.length);
        const randomKey = keys[randomIndex];
        this.chromosome[randomKey] = Math.random();
    }
}

class Population {
    constructor(populationSize, generations, initialPopulation){
        this.populationSize = populationSize;
        this.generations = generations;
        this.population = initialPopulation;
        this.gameInstance;
        this.bestIndividual;
        this.selectedPopulation;
    }

    fitness(gameInstance){
        for (let individual of this.population) {
            gameInstance.reset();
            gameInstance.buildLevel1();
            individual.evaluate(gameInstance);
        }
        this.population.sort((a, b) => b.fitness - a.fitness);
        if (!this.bestIndividual || this.population[0].fitness > this.bestIndividual.fitness) {
            this.bestIndividual = this.population[0];
        }
    }

    selection(selectionRate){
        const lastSelectionIndex = Math.floor(this.population.length * selectionRate);
        this.selectedPopulation = this.population.slice(0, lastSelectionIndex);
    }

    crossover(parent1, parent2){
        const inheritedChromosome = {
            ballXWeight: parent1.chromosome["ballXWeight"],
            ballYWeight: parent1.chromosome["ballYWeight"],
            horSpeedWeight: parent1.chromosome["horSpeedWeight"],
            verSpeedWeight: parent2.chromosome["verSpeedWeight"],
            paddleXWeight: parent2.chromosome["paddleXWeight"],
            individualBias: parent2.chromosome["individualBias"]
        }
        return new Individual(inheritedChromosome);
    }

    mutation(mutationRate){
        for (let individual of this.population) {
            if (Math.random() < mutationRate) {
                individual.mutate();
            }
        }
    }

    nextGeneration() {
        let newGeneration = [];
    }
}

function generateInitialPopulation(){
    let initialPopulation = [];
    for (let i = 0; i < POPULATION_SIZE; i++) {
        initialPopulation.push(new Individual(generateChromosome()));
    }
    return initialPopulation;
}

function generateChromosome(){
    const chromosome = {
        ballXWeight: Math.random(),
        ballYWeight: Math.random(),
        horSpeedWeight: Math.random(),
        verSpeedWeight: Math.random(),
        paddleXWeight: Math.random(),
        individualBias: Math.random()
    };

    return chromosome;
}

window.onload = function() {
    const initialPopulation = generateInitialPopulation();
    let population = new Population(POPULATION_SIZE, GENERATIONS, initialPopulation);

}