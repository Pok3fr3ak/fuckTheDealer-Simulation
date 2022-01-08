interface Card {
    value: number
    suit: string
}

interface TableSlot {
    value: number,
    count: number
}

class Simulation {
    deck: Array<Card>;
    table: TableSlot[];
    type: 'middle' | 'outer';


    constructor(type: 'middle' | 'outer') {
        this.deck = [];
        this.table = [];
        this.type = type;

        this.init();

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

    drawCard() {
        return this.deck.splice(0, 1)
    }

    firstGuess(): number {
        const relevantTable = this.table.filter(x => x.count < 4);
        const probabilityBoard = this.calcProbability(this.deck.length);

        let lowestCheck = this.checkLowestCount(2);

        if (lowestCheck !== false) return lowestCheck;

        let middlePos = this.findNumberInTableWithRelevantBoard(Math.ceil(relevantTable.length / 2));

        if (this.type === 'middle') {
            return middlePos
        } else {
            const left = probabilityBoard.slice(0, middlePos);
            const right = probabilityBoard.slice(-middlePos);
            const leftP = left.reduce((acc, cur) => { return acc + cur });
            const rightP = right.reduce((acc, cur) => { return acc + cur });

            //Probability in left half is higher
            if (leftP > rightP) {
                return this.findNumberInTableWithRelevantBoard(Math.ceil(left.length / 2))
            } else {
                return this.findNumberInTableWithRelevantBoard(Math.floor(right.length / 2))
            }
        }

    }

    secondGuess(value: number, higher: boolean): number {

        const lower = this.table.slice(0, value);
        const upper = this.table.slice(-value);

        if (higher === true) {
            const upperP = this.calcProbability(this.calcCardsLeft(upper))
            return 0
        } else {

            return 0
        }
        //split table at value
        //if higher === true --> search in upper half
        //if higher === false --> search in lower half
    }

    findNumberInTableWithRelevantBoard(number: number): number {
        let currentPos = 0;
        let validValues = 0;
        for (let i = 0; i <= this.table.length; i++) {
            currentPos = i;
            if (this.table[i].count < 4) validValues++;
            if (validValues = number) break;
        }

        return currentPos;
    }

    checkLowestCount(threshhold: number): number | false {
        const lowest = Math.min(...this.table)
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

    calcProbability(numOfCardsLeft: number) {
        return this.table.map(x => {
            return (4 - x.count) / numOfCardsLeft
        })
    }

    calcCardsLeft(board: TableSlot[]) {
        return board.map(x => x.count).reduce((acc, curr) => acc + (4 - curr))
    }

    playCard(card: Card) {
        this.table[card.value].count += 1;
    }
}

export { Simulation }