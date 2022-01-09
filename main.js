"use strict";
exports.__esModule = true;
var Simulation_1 = require("./Simulation");
var fs_1 = require("fs");
console.log('Simulating..');
var fails = 0;
var testSim = new Simulation_1.Simulation('outer', 5);
testSim.startGame();
var simulationLength = 10000;
var output = [];
for (var i = 0; i < simulationLength; i++) {
    if (i % 1000 == 0) {
        console.log("Simulating Games ".concat(1000 * Math.floor(i / 1000), " to ").concat(1000 * Math.floor(i / 1000) + 1000));
    }
    //const element = array[i];
    try {
        var testSim_1 = new Simulation_1.Simulation('outer', 5);
        testSim_1.startGame();
        output.push(testSim_1.getGameInfo());
    }
    catch (e) {
        fails++;
    }
}
console.log('writing file...');
(0, fs_1.writeFile)("".concat(__dirname, "/test/test.txt"), JSON.stringify(output), function (err) {
    console.log(err);
    console.log('WROTE FILE :)');
});
console.log('Done!');
console.log("There were ".concat(fails, " Fails"));
