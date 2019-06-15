import express from 'express';
import isEmpty from 'lodash/isEmpty';
import sortBy from 'lodash/sortBy';

import normalizeFilter from '../../util/normalizeFilter';
import entry from '../entry/router';
import { prettifyCollection } from './util';
import {
    create,
    findLatest,
    getAllByApplication,
    getAllByUser,
    remove,
    update,
} from './service';

const router = express.Router();

const getCollectionsEndpoint = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { application } = res.locals;
    const { user } = req.params;
    const { filter } = req.query;

    let collections;

    try {
        if (isEmpty(user)) {
            collections = await getAllByApplication(application, filter);
        } else {
            collections = await getAllByUser(application, user, filter);
        }
    } catch (error) {
        next({
            status: 502,
            message: error,
        });
        return;
    }

    // @ts-ignore
    const prettyCollections = collections.map(prettifyCollection);
    res.locals.returnData = sortBy(prettyCollections, (collection) => collection.meta.version);

    next();
};
router.get('/collection', normalizeFilter, getCollectionsEndpoint);
router.get('/user/:user/collection', normalizeFilter, getCollectionsEndpoint);

router.get('/user/:user/collection/:collectionUuid', normalizeFilter, async (req, res, next) => {
    const { application } = res.locals;
    const { user, collectionUuid } = req.params;
    const { filter } = req.query;

    let collection;

    try {
        collection = await findLatest(application, user, collectionUuid, filter);
    } catch (error) {
        next({
            status: 502,
            message: error,
        });
        return;
    }

    if (isEmpty(collection)) {
        next({
            status: 404,
        });
        return;
    }

    // @ts-ignore
    res.locals.returnData = collection.map(prettifyCollection);

    next();
});

router.post('/user/:user/collection', async (req, res, next) => {
    const { application } = res.locals;
    const { user } = req.params;
    const data = req.body;

    try {
        await create(
            application,
            user,
            data,
        );
    } catch (error) {
        next({
            status: 502,
            message: error,
        });
        return;
    }

    res.status(201);

    next();
});

router.put('/user/:user/collection/:collectionUuid', async (req, res, next) => {
    const { application } = res.locals;
    const { user, collectionUuid } = req.params;
    const data = req.body;

    let collection;

    try {
        collection = await findLatest(application, user, collectionUuid, 'latest');
    } catch (error) {
        next({
            status: 502,
            message: error,
        });
        return;
    }

    if (isEmpty(collection)) {
        next({
            status: 404,
        });
        return;
    }

    try {
        await update(application, user, collectionUuid, data);
    } catch (error) {
        next({
            status: 502,
            message: error,
        });
        return;
    }

    next();
});

router.delete('/user/:user/collection/:collectionUuid', async (req, res, next) => {
    const { application } = res.locals;
    const { user, collectionUuid } = req.params;

    try {
        await remove(application, user, collectionUuid);
    } catch (error) {
        // TODO
        // Handle dynamodb/network/internal errors
        // Do not always return 404
        console.log('** * **** * *      ERROR       **** * ** * **** * * * **');
        console.log(error);
        console.log('     DIFFERENTIATE BETWEEN VALID 404 / OTHER ERRORS ?');

        next({
            status: 404,
        });
        return;
    }

    next();
});

router.use('/user/:user/collection/:collectionUuid/entry', entry);

export default router;
