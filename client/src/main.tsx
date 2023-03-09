import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import '@picocss/pico/css/pico.css';
import './assets/custom.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
