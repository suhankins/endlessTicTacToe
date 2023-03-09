import { WebSocket } from 'ws';
import { Message } from '../Message.js';
import { Lobby } from './Lobby.js';
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
                const message = JSON.parse(rawData.toString()) as Message;
                switch (message.action) {
                    case 'hostLobby':
                        new Lobby(this.connection);
                        this.removeSelf();
                        break;
                    case 'lobbies':
                        this.connection.send(
                            JSON.stringify({
                                action: 'lobbies',
                                data: Object.keys(Lobby.LOBBIES),
                            })
                        );
                        break;
                    case 'joinLobby':
                        const data = message.data;
                        if (
                            typeof data === 'number' &&
                            Lobby.LOBBIES[data] !== undefined
                        ) {
                            this.connection.send(
                                JSON.stringify({ action: 'joinedLobby' })
                            );
                            Lobby.LOBBIES[data].startGame(this.connection);
                            this.removeSelf();
                        } else {
                            this.connection.send(
                                JSON.stringify({ action: 'joinFailed' })
                            );
                        }
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
