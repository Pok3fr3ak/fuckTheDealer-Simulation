"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.Simulation = void 0;
var Player = /** @class */ (function () {
    function Player(num) {
        this.position = num ? num : 0;
        this.firstTries = 0;
        this.rounds = 0;
        this.dealerRounds = 0;
        this.correctGuesses = 0;
        this.getGuessedOn = 0;
        this.sips = 0;
    }
    return Player;
}());
var CleanPlayerData = /** @class */ (function () {
    function CleanPlayerData() {
        this.position = 0;
        this.firstTries = {};
        this.rounds = {};
        this.dealerRounds = {};
        this.correctGuesses = {};
        this.getGuessedOn = {};
        this.sips = {};
        this.wins = 0;
    }
    return CleanPlayerData;
}());
var Simulation = /** @class */ (function () {
    function Simulation(type, numOfPlayers) {
        this.deck = [];
        this.table = [];
        this.type = type;
        this.numOfPlayers = numOfPlayers;
        this.players = Array.from({ length: numOfPlayers }, function (x, i) { return new Player(i + 1); });
        this.currentPlayer = 2;
        this.currentDealer = 1;
        this.incorrectTotalGuesses = 0;
        this.init();
        this.shuffleCards();
    }
    Simulation.cleanData = function (data) {
        var returnData = new Array(data[0].numOfPlayers).fill(0).map(function (x) { return new CleanPlayerData(); });
        data.forEach(function (x, i) {
            var sips = new Array(x.numOfPlayers).fill(0);
            x.playerData.forEach(function (x, i) {
                sips[i] = x.sips;
            });
            var lowest = Math.min.apply(Math, sips);
            var winners = [];
            for (var i_1 = 0; i_1 < sips.length; i_1++) {
                if (sips[i_1] === lowest)
                    winners.push(i_1);
            }
            x.playerData.forEach(function (x, i) {
                winners.forEach(function (x, j) {
                    if (i === x)
                        returnData[i].wins++;
                });
                returnData[i].position = x.position;
                returnData[i].rounds[x.rounds] = (returnData[i].rounds["".concat(x.rounds)] || 0) + 1;
                returnData[i].dealerRounds[x.dealerRounds] = (returnData[i].dealerRounds[x.dealerRounds] || 0) + 1;
                returnData[i].firstTries[x.firstTries] = (returnData[i].firstTries[x.firstTries] || 0) + 1;
                returnData[i].correctGuesses[x.correctGuesses] = (returnData[i].correctGuesses[x.correctGuesses] || 0) + 1;
                returnData[i].getGuessedOn[x.getGuessedOn] = (returnData[i].getGuessedOn[x.getGuessedOn] || 0) + 1;
                returnData[i].sips[x.sips] = (returnData[i].sips[x.sips] || 0) + 1;
            });
        });
        return Simulation.getOtherStats(returnData);
    };
    Simulation.getOtherStats = function (data) {
        return (data.map(function (x) {
            var totalSips = 0;
            Object.entries(x.sips).forEach(function (_a) {
                var key = _a[0], val = _a[1];
                totalSips += parseInt(key) * val;
            });
            var newPlayerData = __assign(__assign({}, x), { winRate: Math.floor((x.wins / 10000) * 10000) / 100, avgSips: totalSips / 10000 });
            return newPlayerData;
        }));
    };
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
        var card = this.deck[0];
        this.deck.splice(0, 1);
        return card;
    };
    Simulation.prototype.firstGuess = function () {
        var relevantTable = this.table.filter(function (x) { return x.count < 4; });
        var lowestCheck = this.checkLowestCount(2);
        if (lowestCheck !== false)
            return lowestCheck;
        var middle = Math.ceil(relevantTable.length / 2);
        if (middle === undefined)
            middle = Math.floor(relevantTable.length / 2);
        if (this.type === 'middle') {
            if (relevantTable.length === 1)
                return relevantTable[0].value;
            return relevantTable[middle].value;
        }
        else {
            var left = relevantTable.slice(0, middle);
            var right = relevantTable.slice(-middle);
            var leftP = this.calcProbability(left, this.calcCardsLeft(left)).reduce(function (acc, curr) { return acc + curr; });
            var rightP = this.calcProbability(right, this.calcCardsLeft(right)).reduce(function (acc, curr) { return acc + curr; });
            //Probability in left half is higher
            if (leftP > rightP) {
                if (left.length === 1)
                    return left[0].value;
                return left[Math.ceil(left.length / 2)].value;
            }
            else {
                if (right.length === 1)
                    return right[0].value;
                return right[Math.floor(right.length / 2)].value;
            }
        }
    };
    Simulation.prototype.secondGuess = function (value, higher) {
        var lower = this.table.slice(0, (value - 2));
        var upper = this.table.slice(value - 1, this.table.length);
        if (higher === true) {
            //console.log('Card must be higher than guess');
            var upperP = this.calcProbability(upper, this.calcCardsLeft(upper));
            var highP = Math.max.apply(Math, upperP);
            var indicies = this.getAllIndicies(upperP, highP);
            return upper[indicies[Math.floor(Math.random() * indicies.length)]].value;
        }
        else {
            //console.log('Card must be lower than guess');
            var lowerP = this.calcProbability(lower, this.calcCardsLeft(lower));
            var highP = Math.max.apply(Math, lowerP);
            var indicies = this.getAllIndicies(lowerP, highP);
            return lower[indicies[Math.floor(Math.random() * indicies.length)]].value;
        }
    };
    Simulation.prototype.getAllIndicies = function (arr, val) {
        var indicies = [];
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === val)
                indicies.push(i);
        }
        return indicies;
    };
    Simulation.prototype.checkLowestCount = function (threshhold) {
        var lowest = Math.min.apply(Math, this.table.map(function (x) { return x.count; }));
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
    Simulation.prototype.calcProbability = function (board, numOfCardsLeft) {
        return board.map(function (x) {
            return Math.round(((4 - x.count) / numOfCardsLeft) * 1000) / 1000;
        });
    };
    Simulation.prototype.calcCardsLeft = function (board) {
        return board.map(function (x) { return x.count; }).reduce(function (acc, curr) { return acc + (4 - curr); });
    };
    Simulation.prototype.playCard = function (card) {
        //console.log(`A ${card.value} was played`);
        var tablePos = this.table.findIndex(function (x) { return x.value === card.value; });
        if (tablePos !== -1)
            this.table[tablePos].count += 1;
    };
    Simulation.prototype.getGameInfo = function () {
        return {
            numOfPlayers: this.numOfPlayers,
            playerData: this.players
        };
    };
    Simulation.prototype.startGame = function () {
        //console.log(this.deck, this.table);
        var running = true;
        while (running === true) {
            //console.log(this.table);
            this.players[this.currentPlayer - 1].rounds++;
            this.players[this.currentDealer - 1].dealerRounds++;
            var currCard = this.drawCard();
            //console.log(`Current Card is: ${currCard.value} of ${currCard.suit}`);
            var firstGuess = this.firstGuess();
            //console.log(`First Guess was: ${firstGuess}`);
            if (firstGuess === currCard.value) {
                //console.log('Nice! First Try');
                //Adding to Stats                
                this.players[this.currentPlayer - 1].firstTries++;
                this.players[this.currentPlayer - 1].correctGuesses++;
                this.players[this.currentDealer - 1].getGuessedOn++;
                this.players[this.currentDealer - 1].sips += 7;
            }
            else {
                var higher = false;
                if (firstGuess < currCard.value)
                    higher = true;
                var secondGuess = this.secondGuess(firstGuess, higher);
                //console.log(`Second Guess was: ${secondGuess}`)
                if (secondGuess === currCard.value) {
                    //Guessed Correctly on the second try
                    //Adding to Stats
                    this.players[this.currentPlayer - 1].correctGuesses++;
                    this.players[this.currentDealer - 1].getGuessedOn++;
                    this.players[this.currentDealer - 1].sips += 5;
                }
                else {
                    this.players[this.currentPlayer - 1].sips += Math.abs(secondGuess - currCard.value);
                    this.incorrectTotalGuesses++;
                }
            }
            this.playCard(currCard);
            //console.log(`Cards Remaining: ${this.deck.length}`);
            if (this.incorrectTotalGuesses === 3) {
                //console.log('Dealer is changing...');
                this.incorrectTotalGuesses = 0;
                this.currentDealer++;
                if (this.currentDealer > this.numOfPlayers)
                    this.currentDealer = 1;
                //console.log(`New Dealer is Player Nr. ${this.players[this.currentDealer - 1].position}`);
            }
            this.currentPlayer++;
            if (this.currentPlayer === this.currentDealer)
                this.currentPlayer++;
            if (this.currentPlayer > this.numOfPlayers)
                this.currentPlayer = 1;
            if (this.deck.length === 0)
                running = false;
        }
    };
    return Simulation;
}());
exports.Simulation = Simulation;
