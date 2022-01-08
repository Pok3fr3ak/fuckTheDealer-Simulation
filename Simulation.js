"use strict";
exports.__esModule = true;
exports.Simulation = void 0;
var Simulation = /** @class */ (function () {
    function Simulation(type) {
        this.deck = [];
        this.table = [];
        this.type = type;
        this.init();
    }
    Simulation.prototype.init = function () {
        for (var i = 2; i <= 14; i++) {
            this.deck.push({
                value: i,
                suit: "heart"
            }, {
                value: i,
                suit: "spades"
            }, {
                value: i,
                suit: "club"
            }, {
                value: i,
                suit: "diamonds"
            });
            this.table.push({
                value: i,
                count: 0
            });
        }
    };
    Simulation.prototype.shuffleCards = function () {
        for (var i = this.deck.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = this.deck[i];
            this.deck[i] = this.deck[j];
            this.deck[j] = temp;
        }
    };
    Simulation.prototype.drawCard = function () {
        return this.deck.splice(0, 1);
    };
    Simulation.prototype.firstGuess = function () {
        var relevantTable = this.table.filter(function (x) { return x.count < 4; });
        var probabilityBoard = this.calcProbability(this.deck.length);
        var lowestCheck = this.checkLowestCount(2);
        if (lowestCheck !== false)
            return lowestCheck;
        var middlePos = this.findNumberInTableWithRelevantBoard(Math.ceil(relevantTable.length / 2));
        if (this.type === 'middle') {
            return middlePos;
        }
        else {
            var left = probabilityBoard.slice(0, middlePos);
            var right = probabilityBoard.slice(-middlePos);
            var leftP = left.reduce(function (acc, cur) { return acc + cur; });
            var rightP = right.reduce(function (acc, cur) { return acc + cur; });
            //Probability in left half is higher
            if (leftP > rightP) {
                return this.findNumberInTableWithRelevantBoard(Math.ceil(left.length / 2));
            }
            else {
                return this.findNumberInTableWithRelevantBoard(Math.floor(right.length / 2));
            }
        }
    };
    Simulation.prototype.secondGuess = function (value, higher) {
        var lower = this.table.slice(0, value);
        var upper = this.table.slice(-value);
        if (higher === true) {
            var upperP = this.calcProbability(this.calcCardsLeft(upper));
            return 0;
        }
        else {
            return 0;
        }
        //split table at value
        //if higher === true --> search in upper half
        //if higher === false --> search in lower half
    };
    Simulation.prototype.findNumberInTableWithRelevantBoard = function (number) {
        var currentPos = 0;
        var validValues = 0;
        for (var i = 0; i <= this.table.length; i++) {
            currentPos = i;
            if (this.table[i].count < 4)
                validValues++;
            if (validValues = number)
                break;
        }
        return currentPos;
    };
    Simulation.prototype.checkLowestCount = function (threshhold) {
        var lowest = Math.min.apply(Math, this.table);
        var assumption = true;
        this.table.forEach(function (x) {
            if (x.count !== 4) {
                if (x.count - lowest <= threshhold) {
                    assumption = false;
                }
            }
        });
        //@ts-ignore
        if (assumption === false) {
            return false;
        }
        else {
            return lowest;
        }
    };
    Simulation.prototype.calcProbability = function (numOfCardsLeft) {
        return this.table.map(function (x) {
            return (4 - x.count) / numOfCardsLeft;
        });
    };
    Simulation.prototype.calcCardsLeft = function (board) {
        return board.map(function (x) { return x.count; }).reduce(function (acc, curr) { return acc + (4 - curr); });
    };
    Simulation.prototype.playCard = function (card) {
        this.table[card.value].count += 1;
    };
    return Simulation;
}());
exports.Simulation = Simulation;
