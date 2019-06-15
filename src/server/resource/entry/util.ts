import * as express from 'express';
import isEmpty from 'lodash/isEmpty';
import slugify from 'slugify';

import { EntryRaw } from './types';

export const prettifyEntry = (raw: EntryRaw) => {
    const userCollection = raw.userCollection.S;
    const entryVersion = raw.entryVersion.S;

    const collectionStartIndex = userCollection.lastIndexOf('#', (userCollection.length - 2));
    const versionStartIndex = entryVersion.lastIndexOf('#');

    return {
        meta: {
            user: userCollection.slice(0, collectionStartIndex),
            collection:
                userCollection.slice((collectionStartIndex + 1), (userCollection.length - 1)),
            entry: entryVersion.slice(0, versionStartIndex),
            version: parseInt(entryVersion.slice((versionStartIndex + 1)), 10),
            deletedAt: raw.deletedAt
                ? raw.deletedAt.S
                : undefined,
        },
        name: raw.name
            ? raw.name.S
            : undefined,
        value: raw.value
            ? JSON.parse(raw.value.S)
            : undefined,
    };
};

export const getEntrySortKey = (uuid = '', createVersion = false) => {
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
