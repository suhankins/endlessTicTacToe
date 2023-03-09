import { useEffect, useState } from 'react';
import { JsonValue, SendJsonMessage } from 'react-use-websocket/dist/lib/types';
import { Message } from './Message';

export function InLobby({
    setState,
    lastJsonMessage,
    sendJsonMessage,
}: {
    setState: React.Dispatch<React.SetStateAction<string>>;
    lastJsonMessage: JsonValue | null;
    sendJsonMessage: SendJsonMessage;
}) {
    const [lobbyIndex, setLobbyIndex] = useState(
        undefined as number | undefined
    );

    useEffect(() => {
        if (lastJsonMessage !== null) {
            const action = lastJsonMessage as Message;
            switch (action.action) {
                case 'lobbyIndex':
                    setLobbyIndex(action.data);
                    break;
            }
        }
    }, [lastJsonMessage]);

    useEffect(() => {
        sendJsonMessage({ action: 'lobbyIndex' });
    }, []);

    return (
        <>
            <h1>Waiting for other player...</h1>
            {lobbyIndex !== undefined && (
                <h2>Your lobby index is {lobbyIndex}</h2>
            )}
            <div aria-busy="true" />
            <button onClick={() => window.location.reload()}>Disconnect</button>
        </>
    );
}
