"use strict";
exports.__esModule = true;
var Simulation_1 = require("./Simulation");
var fs_1 = require("fs");
console.log('Simulating..');
var fails = 0;
var testSim = new Simulation_1.Simulation('outer', 5);
testSim.startGame();
var simulationLength = 10000;
var outer = new Array(11).fill(0).map(function (x) { return []; });
var middle = new Array(11).fill(0).map(function (x) { return []; });
for (var i = 0; i < simulationLength; i++) {
    if (i % 1000 == 0) {
        console.log("Simulating Games ".concat(1000 * Math.floor(i / 1000), " to ").concat(1000 * Math.floor(i / 1000) + 1000));
    }
    //const element = array[i];
    for (var i_1 = 5; i_1 <= 10; i_1++) {
        try {
            var outerTestSim = new Simulation_1.Simulation('outer', i_1);
            outerTestSim.startGame();
            outer[i_1].push(outerTestSim.getGameInfo());
            var middleTestSim = new Simulation_1.Simulation('middle', i_1);
            middleTestSim.startGame();
            middle[i_1].push(middleTestSim.getGameInfo());
        }
        catch (e) {
            fails++;
        }
    }
}
console.log('writing files...');
for (var i = 5; i <= 10; i++) {
    (0, fs_1.writeFileSync)("".concat(__dirname, "/out/new/").concat(i, "-players-outer.txt"), JSON.stringify(Simulation_1.Simulation.cleanData(outer[i])));
    (0, fs_1.writeFileSync)("".concat(__dirname, "/out/new/").concat(i, "-players-middle.txt"), JSON.stringify(Simulation_1.Simulation.cleanData(middle[i])));
}
console.log('Done!');
console.log("There were ".concat(fails, " Fails"));
