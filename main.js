"use strict";
exports.__esModule = true;
var Simulation_1 = require("./Simulation");
console.log('Simulating...');
var fails = 0;
var testSim = new Simulation_1.Simulation('outer', 5);
testSim.startGame();
/*
const simulationLength = 10000;

for (let i = 0; i < simulationLength; i++) {
    //const element = array[i];
    try{
        let testSim = new Simulation('outer', 5);
        testSim.startGame();
    } catch(e){
        fails++
    }
}

console.log('Done!');
console.log(`There were ${fails} Fails`); */
