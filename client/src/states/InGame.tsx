import { useEffect, useMemo, useState } from 'react';
import { JsonValue, SendJsonMessage } from 'react-use-websocket/dist/lib/types';
import { Message } from '../Message';
import circle from '../assets/circle.svg';
import cross from '../assets/cross.svg';
import { ReloadPage } from '../components/ReloadPage';

const marks = ['crosses', 'circles'];
const markIcons = [
    <></>,
    <img alt="cross" src={cross} />,
    <img alt="circle" src={circle} />,
];
const victoryText = {
    you: 'Congratulations! You won!',
    notYou: 'Sadly, you lost.',
};

export function InGame({
    lastJsonMessage,
    sendJsonMessage,
}: {
    lastJsonMessage: JsonValue | null;
    sendJsonMessage: SendJsonMessage;
}) {
    const [victory, setVictory] = useState('');
    const [field, setField] = useState([[]] as number[][]);
    const [selfIndex, setSelfIndex] = useState(-1);
    const [isMyTurn, setIsMyTurn] = useState(false);

    useEffect(() => {
        if (lastJsonMessage !== null) {
            const message = lastJsonMessage as Message;
            switch (message.action) {
                case 'field':
                    setField(message.data);
                    sendJsonMessage({ action: 'isMyTurn' });
                    break;
                case 'index':
                    setSelfIndex(message.data);
                    break;
                case 'isMyTurn':
                    setIsMyTurn(message.data);
                    break;
                case 'victory':
                    if (message.data === selfIndex) {
                        setVictory(victoryText.you);
                    } else {
                        setVictory(victoryText.notYou);
                    }
                    break;
            }
        }
    }, [lastJsonMessage]);

    useEffect(() => {
        sendJsonMessage({ action: 'field' });
        sendJsonMessage({ action: 'index' });
        sendJsonMessage({ action: 'isMyTurn' });
    }, []);

    const mark = useMemo(
        () => (x: number, y: number) => {
            sendJsonMessage({
                action: 'mark',
                data: [x, y],
            });
        },
        []
    );

    return (
        <div>
            {selfIndex !== -1 && <h1>You play as {marks[selfIndex]}</h1>}
            {isMyTurn && <h2>It's your turn!</h2>}
            <h2>{victory}</h2>
            {victory !== '' && <ReloadPage>Back to menu?</ReloadPage>}
            <div>
                {field.map((row, y) => (
                    <div className="inline">
                        {row.map((square, x) => (
                            <button
                                className="square"
                                onClick={() => mark(x, y)}
                            >
                                {markIcons[square]}
                            </button>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
