interface Card {
    value: number
    suit: string
}

interface TableSlot {
    value: number,
    count: number
}

class Player {
    position: number
    firstTries: number
    rounds: number
    dealerRounds: number
    correctGuesses: number
    getGuessedOn: number
    sips: number

    constructor(num?: number) {
        this.position = num ? num : 0;
        this.firstTries = 0;
        this.rounds = 0;
        this.dealerRounds = 0;
        this.correctGuesses = 0;
        this.getGuessedOn = 0;
        this.sips = 0;
    }
}

class CleanPlayerData {
    position: number
    firstTries: {
        [key: string]: number
    }
    rounds: {
        [key: string]: number
    }
    dealerRounds: {
        [key: string]: number
    }
    correctGuesses: {
        [key: string]: number
    }
    getGuessedOn: {
        [key: string]: number
    }
    sips: {
        [key: string]: number
    }
    wins: number

    constructor() {
        this.position = 0;
        this.firstTries = {};
        this.rounds = {};
        this.dealerRounds = {};
        this.correctGuesses = {};
        this.getGuessedOn = {};
        this.sips = {};
        this.wins = 0;
    }
}

class Simulation {
    deck: Card[];
    table: TableSlot[];
    type: 'middle' | 'outer';
    numOfPlayers: number;
    players: Player[];
    currentPlayer: number;
    currentDealer: number;
    incorrectTotalGuesses: number;


    constructor(type: 'middle' | 'outer', numOfPlayers: number) {
        this.deck = [];
        this.table = [];
        this.type = type;
        this.numOfPlayers = numOfPlayers;
        this.players = Array.from({ length: numOfPlayers }, (x, i) => new Player(i + 1))
        this.currentPlayer = 2;
        this.currentDealer = 1;
        this.incorrectTotalGuesses = 0;

        this.init();
        this.shuffleCards();
    }

    static cleanData(data: Array<{ numOfPlayers: number, playerData: Player[] }>) {
        let returnData = new Array(data[0].numOfPlayers).fill(0).map(x => new CleanPlayerData())
        data.forEach((x, i) => {
            let sips = new Array(x.numOfPlayers).fill(0);
            x.playerData.forEach((x, i) => {
                sips[i] = x.sips
            })

            let lowest = Math.min(...sips)
            let winners:number[] = [];
            for (let i = 0; i < sips.length; i++) {
                if (sips[i] === lowest) winners.push(i)
            }
  
            x.playerData.forEach((x, i) => {
                winners.forEach((x, j) => {
                    if(i === x) returnData[i].wins++;
                })
                returnData[i].position = x.position;
                returnData[i].rounds[x.rounds] = (returnData[i].rounds[`${x.rounds}`] || 0) + 1;
                returnData[i].dealerRounds[x.dealerRounds] = (returnData[i].dealerRounds[x.dealerRounds] || 0) + 1
                returnData[i].firstTries[x.firstTries] = (returnData[i].firstTries[x.firstTries] || 0) + 1
                returnData[i].correctGuesses[x.correctGuesses] = (returnData[i].correctGuesses[x.correctGuesses] || 0) + 1
                returnData[i].getGuessedOn[x.getGuessedOn] = (returnData[i].getGuessedOn[x.getGuessedOn] || 0) + 1
                returnData[i].sips[x.sips] = (returnData[i].sips[x.sips] || 0) + 1
            })
        })
        return Simulation.getOtherStats(returnData)
    }

    static getOtherStats(data: CleanPlayerData[]): any {
        return (data.map(x => {
            let totalSips = 0;
            Object.entries(x.sips).forEach(([key, val]) => {
                totalSips += parseInt(key) * val
            })

            let newPlayerData = {
                ...x,
                winRate: Math.floor((x.wins/10000) * 10000) / 100,
                avgSips: totalSips / 10000
            };

            return newPlayerData
        }))
    }

    init() {
        for (let i = 2; i <= 14; i++) {
            this.deck.push(
                {
                    value: i,
                    suit: "heart"
                },
                {
                    value: i,
                    suit: "spades"
                },
                {
                    value: i,
                    suit: "club"
                },
                {
                    value: i,
                    suit: "diamonds"
                }
            )
            this.table.push({
                value: i,
                count: 0
            })
        }
    }

    shuffleCards() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = this.deck[i];
            this.deck[i] = this.deck[j];
            this.deck[j] = temp;
        }
    }

    drawCard(): Card {
        let card = this.deck[0]
        this.deck.splice(0, 1);
        return card
    }

    firstGuess(): number {
        const relevantTable = this.table.filter(x => x.count < 4);

        let lowestCheck = this.checkLowestCount(2);

        if (lowestCheck !== false) return lowestCheck;

        let middle = Math.ceil(relevantTable.length / 2);
        if (middle === undefined) middle = Math.floor(relevantTable.length / 2);

        if (this.type === 'middle') {
            if (relevantTable.length === 1) return relevantTable[0].value
            return relevantTable[middle].value
        } else {

            const left = relevantTable.slice(0, middle);
            const right = relevantTable.slice(-middle);
            const leftP = this.calcProbability(left, this.calcCardsLeft(left)).reduce((acc, curr) => acc + curr)
            const rightP = this.calcProbability(right, this.calcCardsLeft(right)).reduce((acc, curr) => acc + curr)

            //Probability in left half is higher
            if (leftP > rightP) {
                if (left.length === 1) return left[0].value
                return left[Math.ceil(left.length / 2)].value;
            } else {
                if (right.length === 1) return right[0].value
                return right[Math.floor(right.length / 2)].value;
            }
        }
    }

    secondGuess(value: number, higher: boolean): number {
        const lower = this.table.slice(0, (value - 2));
        const upper = this.table.slice(value - 1, this.table.length);

        if (higher === true) {
            //console.log('Card must be higher than guess');

            const upperP = this.calcProbability(upper, this.calcCardsLeft(upper));
            const highP = Math.max(...upperP)
            let indicies = this.getAllIndicies(upperP, highP)
            return upper[indicies[Math.floor(Math.random() * indicies.length)]].value
        } else {
            //console.log('Card must be lower than guess');

            const lowerP = this.calcProbability(lower, this.calcCardsLeft(lower));
            const highP = Math.max(...lowerP);
            let indicies = this.getAllIndicies(lowerP, highP);
            return lower[indicies[Math.floor(Math.random() * indicies.length)]].value
        }
    }

    getAllIndicies(arr: number[], val: number): number[] {
        let indicies = [];
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === val) indicies.push(i)
        }
        return indicies
    }

    checkLowestCount(threshhold: number): number | false {
        const lowest = Math.min(...this.table.map(x => x.count))
        let assumption = true;

        this.table.forEach(x => {
            if (x.count !== 4) {
                if (x.count - lowest <= threshhold) {
                    assumption = false
                }
            }
        })

        //@ts-ignore
        if (assumption === false) {
            return false
        } else {
            return lowest
        }
    }

    calcProbability(board: TableSlot[], numOfCardsLeft: number) {
        return board.map(x => {
            return Math.round(((4 - x.count) / numOfCardsLeft) * 1000) / 1000
        })
    }

    calcCardsLeft(board: TableSlot[]) {
        return board.map(x => x.count).reduce((acc, curr) => acc + (4 - curr))
    }

    playCard(card: Card) {
        //console.log(`A ${card.value} was played`);
        let tablePos = this.table.findIndex(x => x.value === card.value);

        if (tablePos !== -1) this.table[tablePos].count += 1;
    }

    getGameInfo() {
        return {
            numOfPlayers: this.numOfPlayers,
            playerData: this.players
        }
    }

    startGame() {
        //console.log(this.deck, this.table);
        let running = true;
        while (running === true) {
            //console.log(this.table);
            this.players[this.currentPlayer - 1].rounds++;
            this.players[this.currentDealer - 1].dealerRounds++;
            let currCard = this.drawCard();
            //console.log(`Current Card is: ${currCard.value} of ${currCard.suit}`);
            let firstGuess = this.firstGuess();
            //console.log(`First Guess was: ${firstGuess}`);

            if (firstGuess === currCard.value) {
                //console.log('Nice! First Try');
                //Adding to Stats                
                this.players[this.currentPlayer - 1].firstTries++
                this.players[this.currentPlayer - 1].correctGuesses++
                this.players[this.currentDealer - 1].getGuessedOn++
                this.players[this.currentDealer - 1].sips += 7
            } else {
                let higher = false;
                if (firstGuess < currCard.value) higher = true;
                let secondGuess = this.secondGuess(firstGuess, higher);
                //console.log(`Second Guess was: ${secondGuess}`)

                if (secondGuess === currCard.value) {
                    //Guessed Correctly on the second try
                    //Adding to Stats
                    this.players[this.currentPlayer - 1].correctGuesses++
                    this.players[this.currentDealer - 1].getGuessedOn++
                    this.players[this.currentDealer - 1].sips += 5
                } else {
                    this.players[this.currentPlayer - 1].sips += Math.abs(secondGuess - currCard.value)
                    this.incorrectTotalGuesses++;
                }
            }
            this.playCard(currCard)
            //console.log(`Cards Remaining: ${this.deck.length}`);

            if (this.incorrectTotalGuesses === 3) {
                //console.log('Dealer is changing...');

                this.incorrectTotalGuesses = 0;
                this.currentDealer++
                if (this.currentDealer > this.numOfPlayers) this.currentDealer = 1;
                //console.log(`New Dealer is Player Nr. ${this.players[this.currentDealer - 1].position}`);

            }

            this.currentPlayer++;
            if (this.currentPlayer === this.currentDealer) this.currentPlayer++;
            if (this.currentPlayer > this.numOfPlayers) this.currentPlayer = 1;

            if (this.deck.length === 0) running = false;
        }
    }
}

export { Simulation }