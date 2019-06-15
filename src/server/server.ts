import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Request } from 'express';

import collection from './resource/collection/router';
import handlers from './util/apiHandlers';

declare global {
    namespace Express {
        interface Request {
            user: {
                name: string
            }
        }
    }
}

const app = express();
app
    .use(bodyParser.json())
    .use(handlers.access)
    .use(cors())
    .use(handlers.authorization)
    .use((req, res, next) => {
        if (!req.user || !req.user.name) {
            
        }
        res.locals.application = req.user.name;
        next();
    })
    .use('/api', collection)
    .use(handlers.response)
    .use(handlers.error);

export default app;
