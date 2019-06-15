import * as express from 'express';

import config from '../config';

const access = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log(`REQUEST ::: ${req.method} ${req.originalUrl}`);

    if (config.DEBUG) {
        console.log('REQUEST ::: req.headers');
        console.log(JSON.stringify(req.headers, null, 2));
        console.log('REQUEST ::: req.body');
        console.log(JSON.stringify(req.body, null, 2));
    }

    next();
};

const authorization = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const receivedKey = req.headers['x-api-key'];
    const account = config.API_KEYS.find((apiKey) => apiKey.key === receivedKey);

    if (!receivedKey || !account) {
        next({
            status: 401,
        });
        return;
    }

    req.user = {
        name: account.application,
    };

    if (config.DEBUG) {
        console.log('AUTHORIZATION ::: req.user');
        console.log(JSON.stringify(req.user, null, 2));
    }

    next();
};

const error = (err: {
    status: number,
    message: string | {},
}, req: express.Request, res: express.Response, next: express.NextFunction) => { // eslint-disable-line no-unused-vars
    const status = err.status || 500;

    console.log(`ERROR ::: ${req.method} ${req.originalUrl}`);
    console.log(JSON.stringify(err, null, 2));

    res.status(status).send(err.message);
};

const response = (req: express.Request, res: express.Response) => {
    const { returnData } = res.locals;

    console.log(`SUCCESS ::: ${req.method} ${req.originalUrl}`);

    if (returnData) {
        if (config.DEBUG) {
            console.log('SUCCESS ::: response returnData');
            console.log(JSON.stringify(returnData, null, 2));
        }

        res.json(returnData);
        return;
    }

    res.send();
};

const apiHandlers = {
    access,
    authorization,
    error,
    response,
};

export default apiHandlers;
