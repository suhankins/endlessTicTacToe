import { httpServer } from './httpServer.js';
import { createServer } from 'http';
import * as dotenv from 'dotenv';
import { startWsServer } from './websocket.js';
dotenv.config();

httpServer.set('port', process.env.PORT || 9000);

let server = createServer(httpServer);

startWsServer(server);

server.listen(httpServer.get('port'), () => {
    console.log(`HTTP server listening on port ${httpServer.get('port')}`);
});
