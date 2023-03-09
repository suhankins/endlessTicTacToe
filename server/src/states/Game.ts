import { WebSocket } from 'ws';
import { State } from './State.js';

type Square = 0 | 1 | 2;

export class Game {
    static DEFAULT_SIZE = 3;

    crosses: WebSocket;
    circles: WebSocket;
    field: Square[][] = this.emptyField(Game.DEFAULT_SIZE);

    constructor(crosses: WebSocket, circles: WebSocket) {
        this.crosses = crosses;
        this.circles = circles;

        console.log(`New game started!`);
    }

    emptyField(size: number) {
        return [...Array(size)].map(() =>
            [...Array(size)].map(() => 0 as Square)
        );
    }

    sendField() {
        const response = JSON.stringify({ action: 'field', data: this.field });
        this.crosses.send(response);
        this.circles.send(response);
    }
}
