import { useState, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Connected } from './states/Connected.js';
import { Connecting } from './states/Connecting.js';
import { Disconnected } from './states/Disconnected.js';
import { InLobby } from './states/InLobby.js';
import { InGame } from './states/InGame.js';

export const App = () => {
    const { lastJsonMessage, sendJsonMessage, readyState } = useWebSocket(
        import.meta.env.DEV ? 'ws://localhost:9000' :
        'wss://endlesstictactoe.onrender.com',
        { onClose: () => setState('disconnected') }
    );

    const [state, setState] = useState('connecting');

    useEffect(() => {
        if (readyState === ReadyState.OPEN) setState('connected');
    }, [readyState]);

    return (
        <div className="container">
            <article>
                {(() => {
                    switch (state) {
                        case 'connected':
                            return (
                                <Connected
                                    setState={setState}
                                    sendJsonMessage={sendJsonMessage}
                                    lastJsonMessage={lastJsonMessage}
                                />
                            );
                        case 'inLobby':
                            return (
                                <InLobby
                                    setState={setState}
                                    sendJsonMessage={sendJsonMessage}
                                    lastJsonMessage={lastJsonMessage}
                                />
                            );
                        case 'inGame':
                            return (
                                <InGame
                                    sendJsonMessage={sendJsonMessage}
                                    lastJsonMessage={lastJsonMessage}
                                />
                            );
                        case 'disconnected':
                            return <Disconnected />;
                        default:
                            return <Connecting />;
                    }
                })()}
            </article>
        </div>
    );
};
