import { WebSocket } from 'ws';
import { MultiConnectionState } from './State.js';

type Square = 0 | 1 | 2;

export class Game extends MultiConnectionState {
    static DEFAULT_SIZE = 3;

    public get crosses() {
        return this.connection[0];
    }
    public get circles() {
        return this.connection[1];
    }

    field: Square[][] = this.emptyField(Game.DEFAULT_SIZE);

    constructor(crosses: WebSocket, circles: WebSocket) {
        super([crosses, circles]);

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

    removeSelf(): void {
        
    }
}
