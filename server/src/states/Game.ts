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

    private whoseTurn: number = 0;
    private symbolsNeeded: number = 3;

    /**
     * Field must be square or else some validation logic will fail
     */
    private field: number[][] = this.getEmptyField(Game.DEFAULT_SIZE);

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
                                win.line.forEach((square) => {
                                    this.field[square.y][square.x] += 2;
                                });
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
    checkWin():
        | { symbol: number; line: { x: number; y: number }[] }
        | undefined {
        const size = this.field.length;

        // Check rows
        for (let row = 0; row < size; row++) {
            let symbol = this.field[row][0];
            let count = 1;
            let line = [{ x: 0, y: row }];
            for (let col = 1; col < size; col++) {
                if (this.field[row][col] === symbol) {
                    count++;
                    line.push({ x: col, y: row });
                    if (count === this.symbolsNeeded && symbol !== 0) {
                        return {
                            symbol: symbol,
                            line: line,
                        };
                    }
                } else {
                    symbol = this.field[row][col];
                    count = 1;
                    line = [{ x: col, y: row }];
                }
            }
        }

        // Check columns
        for (let col = 0; col < size; col++) {
            let symbol = this.field[0][col];
            let count = 1;
            let line = [{ x: col, y: 0 }];
            for (let row = 1; row < size; row++) {
                if (this.field[row][col] === symbol) {
                    count++;
                    line.push({ x: col, y: row });
                    if (count === this.symbolsNeeded && symbol !== 0) {
                        return {
                            symbol: symbol,
                            line: line,
                        };
                    }
                } else {
                    symbol = this.field[row][col];
                    count = 1;
                    line = [{ x: col, y: row }];
                }
            }
        }

        // Check diagonals
        // Top-left to bottom-right diagonals
        for (let row = 0; row < size - this.symbolsNeeded + 1; row++) {
            for (let col = 0; col < size - this.symbolsNeeded + 1; col++) {
                let symbol = this.field[row][col];
                let count = 1;
                let line = [{ x: col, y: row }];
                for (let i = 1; i < this.symbolsNeeded; i++) {
                    if (this.field[row + i][col + i] === symbol) {
                        count++;
                        line.push({ x: col + i, y: row + i });
                        if (count === this.symbolsNeeded && symbol !== 0) {
                            return {
                                symbol: symbol,
                                line: line,
                            };
                        }
                    } else {
                        break;
                    }
                }
            }
        }

        // Top-right to bottom-left diagonals
        for (let row = 0; row < size - this.symbolsNeeded + 1; row++) {
            for (let col = size - 1; col >= this.symbolsNeeded - 1; col--) {
                let symbol = this.field[row][col];
                let count = 1;
                let line = [{ x: col, y: row }];
                for (let i = 1; i < this.symbolsNeeded; i++) {
                    if (this.field[row + i][col - i] === symbol) {
                        count++;
                        line.push({ x: col - i, y: row + i });
                        if (count === this.symbolsNeeded && symbol !== 0) {
                            return {
                                symbol: symbol,
                                line: line,
                            };
                        }
                    } else {
                        break;
                    }
                }
            }
        }

        return undefined;
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

    getEmptyField(size: number) {
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
