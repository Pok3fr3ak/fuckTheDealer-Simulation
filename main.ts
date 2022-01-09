import { Simulation } from "./Simulation";
import { writeFileSync } from 'fs';

console.log('Simulating..');

let fails = 0;
let testSim = new Simulation('outer', 5);
testSim.startGame();

const simulationLength = 10000;

let outer: any = new Array(11).fill(0).map(x => [])
let middle: any = new Array(11).fill(0).map(x => [])

for (let i = 0; i < simulationLength; i++) {
    if (i % 1000 == 0) {
        console.log(`Simulating Games ${1000 * Math.floor(i / 1000)} to ${1000 * Math.floor(i / 1000) + 1000}`);
    }
    //const element = array[i];

    for(let i = 5; i <= 10; i++){
        try {
            let outerTestSim = new Simulation('outer', i);
            outerTestSim.startGame();
            outer[i].push(outerTestSim.getGameInfo());

            let middleTestSim = new Simulation('middle', i);
            middleTestSim.startGame();
            middle[i].push(middleTestSim.getGameInfo());
        } catch (e) {
            fails++
        }
    }

}
console.log('writing files...');

for(let i = 5; i <= 10; i++){
    writeFileSync(`${__dirname}/out/${i}-players-outer.txt`, JSON.stringify(outer[i]))

    writeFileSync(`${__dirname}/out/${i}-players-middle.txt`, JSON.stringify(middle[i]))
}

console.log('Done!');
console.log(`There were ${fails} Fails`);

