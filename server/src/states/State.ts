import WebSocket from 'ws';

export abstract class State {
    connection: WebSocket;
    constructor(connection: WebSocket) {
        this.connection = connection;
        this.connection.removeAllListeners();
    }
    abstract removeSelf(): void;
}
