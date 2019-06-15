import express from 'express';
import isEmpty from 'lodash/isEmpty';
import sortBy from 'lodash/sortBy';

import normalizeFilter from '../../util/normalizeFilter';

import {
    prettifyEntry,
    validateEntryInput,
} from './util';
import {
    create,
    getAllByUserCollection,
    findLatest,
    update,
    remove,
} from './service';


const router = express.Router({
    mergeParams: true,
});

router.get('/', normalizeFilter, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {
        user,
        collectionUuid,
    } = req.params;
    const { filter } = req.query;

    let entries;

    try {
        entries = await getAllByUserCollection(user, collectionUuid, filter);
    } catch (error) {
        next({
            status: 502,
            message: error,
        });
        return;
    }

    // @ts-ignore
    entries = entries.map(prettifyEntry);
    res.locals.returnData = sortBy(entries, (entry) => entry.meta.version);

    next();
});

router.get('/:entryUuid', normalizeFilter, async (req, res, next) => {
    const { user, collectionUuid, entryUuid } = req.params;
    const { filter } = req.query;

    let entry;

    try {
        entry = await findLatest(user, collectionUuid, entryUuid, filter);
    } catch (error) {
        next({
            status: 502,
            message: error,
        });
        return;
    }

    if (isEmpty(entry)) {
        next({
            status: 404,
        });
        return;
    }

    // @ts-ignore
    res.locals.returnData = entry.map(prettifyEntry);

    next();
});

router.post('/', validateEntryInput, async (req, res, next) => {
    const { user, collectionUuid } = req.params;
    const data = req.body;

    try {
        await create(user, collectionUuid, data);
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


router.put('/:entryUuid', validateEntryInput, async (req, res, next) => {
    const { user, collectionUuid, entryUuid } = req.params;
    const data = req.body;

    let entry;

    try {
        entry = await findLatest(user, collectionUuid, entryUuid, 'latest');
    } catch (error) {
        next({
            status: 502,
            message: error,
        });
        return;
    }

    if (isEmpty(entry)) {
        next({
            status: 404,
        });
        return;
    }

    try {
        await update(user, collectionUuid, entryUuid, data);
    } catch (error) {
        next({
            status: 502,
            message: error,
        });
        return;
    }

    next();
});

router.delete('/:entryUuid', async (req, res, next) => {
    const { user, collectionUuid, entryUuid } = req.params;

    try {
        await remove(user, collectionUuid, entryUuid);
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

export default router;
