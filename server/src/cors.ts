import { NextFunction, Response, Request } from 'express';

export function cors(_req: Request, res: Response, next: NextFunction) {
    if (process.env.DEVELOPMENT === 'true') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');
    }
    next();
}
