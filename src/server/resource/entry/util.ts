import * as express from 'express';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import slugify from 'slugify';

import { EntryRaw } from './types';

export const prettifyEntry = (raw: EntryRaw) => {
    const userCollection = raw.userCollection.S;
    const entryVersion = raw.entryVersion.S;

    const collectionStartIndex = userCollection.lastIndexOf('#', (userCollection.length - 2));
    const versionStartIndex = entryVersion.lastIndexOf('#');

    const user = userCollection.slice(0, collectionStartIndex);
    const collection = userCollection.slice((collectionStartIndex + 1), (userCollection.length - 1));
    const entry = entryVersion.slice(0, versionStartIndex);
    const version = parseInt(entryVersion.slice((versionStartIndex + 1)), 10);
    const deletedAt = get(raw, 'deletedAt.S');

    const name = get(raw, 'name.S');
    const valueRaw = get(raw, 'value.S');

    return {
        meta: {
            user,
            collection,
            entry,
            version,
            deletedAt,
        },
        name,
        value: valueRaw
            ? JSON.parse(valueRaw)
            : undefined,
    };
};

export const getEntryRangeKey = (uuid = '', createVersion = false) => {
    let name = `${slugify(uuid)}#`;

    if (createVersion) {
        name += `${Date.now().toString()}`;
    }

    return name;
};

export const validateEntryInput = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {
        name,
        value,
    } = req.body;

    try {
        if (isEmpty(name) && isEmpty(value)) {
            throw new Error('Entry name or value required');
        }

        if (!isEmpty(value) && !(typeof value === 'object' || (value && value.constructor === Object))) {
            throw new Error('Invalid entry payload');
        }

        next();
    } catch (error) {
        next({
            status: 400,
            message: error.toString(),
        });
    }
};
