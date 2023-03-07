import { WebSocketServer } from 'ws';
import { Connected } from './states/Connected.js';

let ws: WebSocketServer;

export function startWsServer(server: any) {
    ws = new WebSocketServer({ server: server });
    ws.on('listening', () => {
        const addressRaw = ws.address();
        const address =
            typeof addressRaw === 'string'
                ? addressRaw
                : `${addressRaw.address}:${addressRaw.port}`;
        console.log(`Websocket server listening on ${address}`);
    });

    ws.on('connection', (connection) => {
        new Connected(connection);
    });
}
