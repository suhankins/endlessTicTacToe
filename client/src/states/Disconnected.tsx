import { ReloadPage } from "../components/ReloadPage";

export function Disconnected() {
    return (
        <div>
            <h1>Connection to the server has been lost</h1>
            <h2>Reconnect?</h2>
            <ReloadPage>Reconnect</ReloadPage>
        </div>
    )
}