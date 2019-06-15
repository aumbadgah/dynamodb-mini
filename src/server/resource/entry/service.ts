import last from 'lodash/last';
import isEmpty from 'lodash/isEmpty';
import uuidV4 from 'uuid/v4';
import get from 'lodash/get';

import config from '../../config';
import db from '../../db';
import filterItems, { Filter } from '../../util/filterItems';
import { getCollectionRangeKey } from '../collection/util';

import { getEntrySortKey } from './util';

const {
    AWS_DYNAMODB_CONSISTENT_READ,
    tableNames,
} = config;

export const getAllByUserCollection = async (
    user: string,
    collection: string,
    filter: Filter,
) => {
    const hashKey = getCollectionRangeKey(user, collection);

    const result = await db.query({
        TableName: tableNames.entries,
        ConsistentRead: AWS_DYNAMODB_CONSISTENT_READ,
        ExpressionAttributeValues: {
            ':hashKey': {
                S: hashKey,
            },
        },
        KeyConditionExpression: 'userCollection = :hashKey',
    }).promise();

    if (!result.Items) {
        return Promise.resolve([]);
    }

    return filterItems('entryVersion', filter, result.Items);
};

const find = async (
    hashKey: string,
    sortKeyPartial: string,
    options?: {},
) => {
    const query = {
        TableName: tableNames.entries,
        ConsistentRead: AWS_DYNAMODB_CONSISTENT_READ,
        ExpressionAttributeValues: {
            ':hashKey': {
                S: hashKey,
            },
            ':sortKeyPartial': {
                S: sortKeyPartial,
            },
        },
        KeyConditionExpression: 'userCollection = :hashKey and begins_with(entryVersion, :sortKeyPartial)',
    };

    if (!isEmpty(options)) {
        Object.assign(query, options);
    }

    const results = await db.query(query).promise();

    return results.Items;
};

interface EntryInput {
    deletedAt?: string,
    name?: string,
    value?: string,
};

const validateString = (value: any) => {
    if (!isEmpty(value) && !(typeof value === 'string' || value instanceof String)) {
        throw new Error('Invalid entry name');
    }
}

const put = async (
    userCollection: string,
    entryVersion: string,
    data: EntryInput,
) => {
    const {
        name,
        value,
        deletedAt,
    } = data;

    if (isEmpty(name) && isEmpty(value)) {
        throw new Error('Entry name or value required');
    }

    validateString(name);
    validateString(value);

    await db.putItem({
        // @ts-ignore: Unreachable code error
        TableName: tableNames.entries,
        Item: {
            userCollection: {
                S: userCollection,
            },
            entryVersion: {
                S: entryVersion,
            },
            name: name
                ? {
                    S: name,
                }
                : undefined,
            value: value
                ? {
                    S: value,
                }
                : undefined,
            deletedAt: deletedAt
                ? {
                    S: deletedAt,
                }
                : undefined,
        },
    }).promise();
};

export const findLatest = async (
    user: string,
    collection: string,
    uuid: string,
    filter: string,
) => {
    const hashKey = getCollectionRangeKey(user, collection);
    const sortKeyPartial = getEntrySortKey(uuid);

    const results = await find(hashKey, sortKeyPartial);

    if (filter === 'latest') {
        const latest = last(results);
        if (!latest || latest.deletedAt) {
            return [];
        }
        return [latest];
    }

    if (filter === 'current') {
        return [last(results)];
    }

    return results;
};

export const create = async (
    user: string,
    collection: string,
    data: EntryInput,
) => {
    const hashKey = getCollectionRangeKey(user, collection);

    const appendVersion = true;
    const sortKey = getEntrySortKey(uuidV4(), appendVersion);

    const {
        name,
        value,
    } = data;

    await put(hashKey, sortKey, {
        name,
        value: value
            ? JSON.stringify(value)
            : undefined,
    });
};

export const update = async (
    user: string,
    collection: string,
    entry: string,
    data: EntryInput,
) => {
    const hashKey = getCollectionRangeKey(user, collection);

    const appendVersion = true;
    const sortKey = getEntrySortKey(entry, appendVersion);

    const {
        name,
        value,
    } = data;

    await put(hashKey, sortKey, {
        name,
        value: value
            ? JSON.stringify(value)
            : undefined,
    });
};

export const remove = async (
    user: string,
    collection: string,
    entryUuid: string,
) => {
    const results = await findLatest(user, collection, entryUuid, 'latest');
    const entry = last(results);

    if (isEmpty(entry)) {
        throw new Error('Not found');
    }

    const deletedEntry = {
        value: get(entry, 'value.S'),
        deletedAt: new Date().toISOString(),
        name: get(entry, 'name.S', ''),
    };
    const collectionId = get(entry, 'userCollection.S');
    const version = get(entry, 'entryVersion.S');

    validateString(collectionId);
    validateString(version);

    // @ts-ignore
    await put(collectionId, version, deletedEntry);
};
