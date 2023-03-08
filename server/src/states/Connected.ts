import { WebSocket } from 'ws';
import { ActionMessage } from '../ActionMessage.js';
import { InLobby } from './InLobby.js';
import { State } from './State.js';

export class Connected extends State {
    index: number;

    static PLAYERS: { [id: number]: Connected } = {};
    static GLOBAL_INDEX = 0;

    constructor(connection: WebSocket) {
        super(connection);

        this.index = Connected.GLOBAL_INDEX++;
        Connected.PLAYERS[this.index] = this;
        console.log(`Player ${this.index} connected`);

        this.connection.on('message', (rawData) => {
            try {
                const data = JSON.parse(rawData.toString()) as ActionMessage;
                switch (data.action) {
                    case 'hostLobby':
                        new InLobby(this.connection);
                        this.removeSelf();
                        break;
                    case 'lobbies':
                        this.connection.send(
                            JSON.stringify({
                                action: 'lobbies',
                                data: Object.keys(InLobby.LOBBIES),
                            })
                        );
                        break;
                }
            } catch (e) {
                console.error(`Player ${this.index} caused an error!`);
                console.error(e);
                this.connection.close();
            }
        });

        this.connection.on('close', () => {
            console.log(`Player ${this.index} disconnected`);
            this.removeSelf();
        });
    }

    removeSelf() {
        delete Connected.PLAYERS[this.index];
    }
}
