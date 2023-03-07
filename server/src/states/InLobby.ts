import WebSocket from 'ws';
import { ActionMessage } from '../ActionMessage.js';
import { State } from './State.js';

export class InLobby extends State {
    index: number;

    static LOBBIES = new Map<number, InLobby>();
    static GLOBAL_INDEX = 0;

    constructor(connection: WebSocket) {
        super(connection);

        this.index = InLobby.GLOBAL_INDEX++;
        InLobby.LOBBIES.set(this.index, this);
        console.log(`Lobby ${this.index} created`);

        this.connection.on('message', (rawData) => {
            const data = JSON.parse(rawData.toString()) as ActionMessage;
            switch (data.action) {
                case 'lobbyIndex':
                    this.connection.send(
                        JSON.stringify({
                            action: 'lobbyIndex',
                            data: this.index,
                        })
                    );
                    break;
            }
        });

        this.connection.on('close', () => {
            console.log(`Lobby ${this.index} disconnected`);
            this.removeSelf();
        });
    }

    removeSelf() {
        InLobby.LOBBIES.delete(this.index);
    }
}
