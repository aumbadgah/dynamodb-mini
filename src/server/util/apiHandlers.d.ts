import * as express from 'express';
declare const apiHandlers: {
    access: (req: express.Request, res: express.Response, next: express.NextFunction) => void;
    authorization: (req: express.Request, res: express.Response, next: express.NextFunction) => void;
    error: (err: {
        status: number;
        message: string | {};
    }, req: express.Request, res: express.Response, next: express.NextFunction) => void;
    response: (req: express.Request, res: express.Response) => void;
};
export default apiHandlers;
