import { Simulation } from "./Simulation";
import { writeFile } from 'fs';

console.log('Simulating..');

let fails = 0;
let testSim = new Simulation('outer', 5);
testSim.startGame();

const simulationLength = 10000;

let output = [];

for (let i = 0; i < simulationLength; i++) {
    if (i % 1000 == 0) {
        console.log(`Simulating Games ${1000 * Math.floor(i / 1000)} to ${1000 * Math.floor(i / 1000) + 1000}`);
    }


    //const element = array[i];
    try {
        let testSim = new Simulation('outer', 5);
        testSim.startGame();
        output.push(testSim.getGameInfo());

    } catch (e) {
        fails++
    }
}

console.log('writing file...');
writeFile(`${__dirname}/test/test.txt`, JSON.stringify(output), (err) => {
    console.log(err);
    
    console.log('WROTE FILE :)');
})

console.log('Done!');
console.log(`There were ${fails} Fails`);

