import { useEffect, useState } from 'react';
import {
    JsonValue,
    SendJsonMessage,
} from 'react-use-websocket/dist/lib/types.js';
import { Action } from './Action.js';

export function Connected({
    setState,
    lastJsonMessage,
    sendJsonMessage,
}: {
    setState: React.Dispatch<React.SetStateAction<string>>;
    lastJsonMessage: JsonValue | null;
    sendJsonMessage: SendJsonMessage;
}) {
    const [lobbies, setLobbies] = useState([] as number[]);

    const getLobbies = () => sendJsonMessage({ action: 'lobbies' });
    useEffect(() => getLobbies(), []);

    useEffect(() => {
        if (lastJsonMessage !== null) {
            const action = lastJsonMessage as Action;
            switch (action.action) {
                case 'lobbies':
                    setLobbies(action.data);
                    break;
            }
        }
    }, [lastJsonMessage]);

    return (
        <div className="grid">
            <div>
                <h2>Lobbies: {lobbies.length}</h2>
                <div>
                    {lobbies.map((value) => (
                        <button key={value} className="contrast">
                            Join lobby #{value}
                        </button>
                    ))}
                </div>
                <button className="outline" onClick={getLobbies}>
                    Refresh
                </button>
            </div>
            <div>
                <button
                    onClick={() => {
                        sendJsonMessage({ action: 'hostLobby' });
                        setState('inLobby');
                    }}>
                    Host your own lobby
                </button>
            </div>
        </div>
    );
}
