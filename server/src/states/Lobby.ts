import WebSocket from 'ws';
import { Message } from '../Message.js';
import { Game } from './Game.js';
import { State } from './State.js';

export class Lobby extends State {
    index: number;

    static LOBBIES: { [id: number]: Lobby } = {};
    static GLOBAL_INDEX = 0;

    constructor(connection: WebSocket) {
        super(connection);

        this.index = Lobby.GLOBAL_INDEX++;
        Lobby.LOBBIES[this.index] = this;
        console.log(`Lobby ${this.index} created`);

        this.connection.on('message', (rawData) => {
            try {
                const message = JSON.parse(rawData.toString()) as Message;
                switch (message.action) {
                    case 'lobbyIndex':
                        this.connection.send(
                            JSON.stringify({
                                action: 'lobbyIndex',
                                data: this.index,
                            })
                        );
                        break;
                }
            } catch (e) {
                console.error(`Lobby ${this.index} caused an error!`);
                console.error(e);
                this.connection.close();
            }
        });

        this.connection.on('close', () => {
            console.log(`Lobby ${this.index} disconnected`);
            this.removeSelf();
        });
    }

    startGame(otherPlayer: WebSocket) {
        this.connection.send(JSON.stringify({ action: 'joinedLobby' }));
        console.log(`Lobby ${this.index} closed, beginning a game`);
        new Game(this.connection, otherPlayer);
        this.removeSelf();
    }

    removeSelf() {
        delete Lobby.LOBBIES[this.index];
    }
}
