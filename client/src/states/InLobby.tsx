import { useEffect, useState } from 'react';
import { JsonValue, SendJsonMessage } from 'react-use-websocket/dist/lib/types';
import { Message } from '../Message';
import { ReloadPage } from '../components/ReloadPage';

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
            const message = lastJsonMessage as Message;
            switch (message.action) {
                case 'lobbyIndex':
                    setLobbyIndex(message.data);
                    break;
                case 'joinedLobby':
                    setState('inGame');
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
            <ReloadPage>Disconnect</ReloadPage>
        </>
    );
}
