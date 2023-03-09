import { WebSocket } from 'ws';
import { Message } from '../Message.js';
import { MultiConnectionState } from './State.js';

export class Game extends MultiConnectionState {
    public index: number;
    static GLOBAL_INDEX: number = 0;
    static DEFAULT_SIZE = 3;

    get crosses() {
        return this.connection[0];
    }
    get circles() {
        return this.connection[1];
    }

    whoseTurn: number = 0;

    /**
     * Field must be square or else some validation logic will fail
     */
    field: number[][] = this.emptyField(Game.DEFAULT_SIZE);

    constructor(crosses: WebSocket, circles: WebSocket) {
        super([crosses, circles]);

        this.index = Game.GLOBAL_INDEX++;

        console.log(`Game ${this.index} started!`);

        this.connection.forEach((websocket, index) => {
            websocket.on('message', (rawData) => {
                try {
                    const message = JSON.parse(rawData.toString()) as Message;
                    switch (message.action) {
                        case 'field':
                            websocket.send(
                                JSON.stringify({
                                    action: 'field',
                                    data: this.field,
                                })
                            );
                            break;
                        case 'index':
                            websocket.send(
                                JSON.stringify({
                                    action: 'index',
                                    data: index,
                                })
                            );
                            break;
                        case 'mark':
                            const spot = message.data as [number, number];
                            if (
                                index !== this.whoseTurn ||
                                this.outOfBounds(spot) ||
                                this.field[spot[1]][spot[0]] !== 0
                            ) {
                                console.log(
                                    `Player ${index} tried to do an illegal move in game ${this.index}`
                                );
                                break;
                            }
                            this.field[spot[1]][spot[0]] = index + 1;
                            const win = this.checkWin();
                            if (win === undefined) {
                                this.whoseTurn =
                                    this.whoseTurn === 0
                                        ? (this.whoseTurn = 1)
                                        : (this.whoseTurn = 0);
                                if (this.checkDraw()) this.expandField();
                            } else {
                                this.victory(this.whoseTurn);
                                this.whoseTurn = -1;
                            }
                            this.sendField();
                            break;
                        case 'isMyTurn':
                            websocket.send(
                                JSON.stringify({
                                    action: 'isMyTurn',
                                    data: this.whoseTurn === index,
                                })
                            );
                            break;
                    }
                } catch (e) {
                    console.error(`Error in game ${this.index}!`);
                    console.error(e);
                    this.removeSelf();
                }
            });

            websocket.on('close', () => {
                console.log(
                    `Player ${index} disconnected from game ${this.index}!`
                );
                this.removeSelf();
            });
        });
    }

    victory(winner: number) {
        this.connection.forEach((websocket) =>
            websocket.send(JSON.stringify({ action: 'victory', data: winner }))
        );
    }

    expandField() {
        // adding new row
        this.field.push([...Array(this.field.length)].map((value) => 0));
        // adding new column
        this.field.forEach((row) => row.push(0));
    }

    /**
     * @returns winner's index + 1 or undefined
     */
    checkWin() {
        // column && diagonal
        for (let y = 0; y < this.field.length - 2; y++) {
            // column
            for (let x = 0; x < this.field.length; x++)
                if (this.checkColumn(x, y)) return this.field[y][x];
            // diagonal
            for (let x = 0; x < this.field.length - 2; x++)
                if (this.checkDiagonal(x, y)) return this.field[y][x];
        }
        // row
        for (let y = 0; y < this.field.length; y++) {
            for (let x = 0; x < this.field.length - 2; x++)
                if (this.checkRow(x, y)) return this.field[y][x];
        }
        return undefined;
    }

    /**
     * X . .
     * X . .
     * X . .
     */
    checkColumn(x: number, y: number) {
        return (
            this.field[y][x] !== 0 &&
            this.field[y][x] === this.field[y + 1][x] &&
            this.field[y][x] === this.field[y + 2][x]
        );
    }

    /**
     * X X X
     * . . .
     * . . .
     */
    checkRow(x: number, y: number) {
        return (
            this.field[y][x] !== 0 &&
            this.field[y][x] === this.field[y][x + 1] &&
            this.field[y][x] === this.field[y][x + 2]
        );
    }

    /**
     * X . .
     * . X .
     * . . X
     */
    checkDiagonal(x: number, y: number) {
        return (
            this.field[y][x] !== 0 &&
            this.field[y][x] === this.field[y + 1][x + 1] &&
            this.field[y][x] === this.field[y + 2][x + 2]
        );
    }

    checkDraw() {
        return this.field.every((row) => row.every((column) => column !== 0));
    }

    outOfBounds(spot: [number, number]) {
        return spot.some((value, i) => {
            let maxLength = i === 0 ? this.field.length : this.field[0].length;
            return !(value >= 0 && value < maxLength);
        });
    }

    emptyField(size: number) {
        return [...Array(size)].map(() => [...Array(size)].map(() => 0));
    }

    sendField() {
        const response = JSON.stringify({ action: 'field', data: this.field });
        this.connection.forEach((websocket) => websocket.send(response));
    }

    removeSelf(): void {
        this.connection.forEach((websocket) => websocket.close());
    }
}
