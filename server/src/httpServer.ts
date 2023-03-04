import express from 'express';
import { cors } from './cors.js';

export let httpServer = express();

httpServer.use(cors);

httpServer.use(express.static('public'));
