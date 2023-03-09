import WebSocket from 'ws';

interface IState {
    connection: WebSocket | WebSocket[];
    removeSelf(): void;
}

export abstract class State implements IState {
    connection: WebSocket;
    constructor(connection: WebSocket) {
        this.connection = connection;
        this.connection.removeAllListeners();
    }
    abstract removeSelf(): void;
}

export abstract class MultiConnectionState implements IState {
    connection: WebSocket[];
    constructor(connection: WebSocket[]) {
        this.connection = connection;
        this.connection.forEach((websocket) => websocket.removeAllListeners());
    }
    abstract removeSelf(): void;
}
