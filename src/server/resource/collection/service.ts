import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import last from 'lodash/last';
import uuidV4 from 'uuid/v4';

import config from '../../config';
import db from '../../db';
import filterItems, { Filter } from '../../util/filterItems';

import { getCollectionRangeKey } from './util';

const {
    AWS_DYNAMODB_CONSISTENT_READ,
    tableNames,
} = config;

const find = async (
    application: string,
    namePartial: string,
    options?: {},
) => {
    const query = {
        TableName: tableNames.collections,
        ConsistentRead: AWS_DYNAMODB_CONSISTENT_READ,
        ExpressionAttributeValues: {
            ':application': {
                S: application,
            },
            ':namePartial': {
                S: namePartial,
            },
        },
        KeyConditionExpression: 'application = :application and begins_with(userCollectionVersion, :namePartial)',
    };

    let results;

    if (!isEmpty(options)) {
        Object.assign(query, options);
    }

    try {
        results = await db.query(query).promise();
    } catch (error) {
        throw new Error(error);
    }

    return get(results, 'Items', []);
};

const put = async (
    application: string,
    userCollectionVersion: string,
    data: {
        deletedAt?: string,
        name: string,
    },
) => {
    const params = {
        TableName: tableNames.collections,
        Item: {
            application: {
                S: application,
            },
            userCollectionVersion: {
                S: userCollectionVersion,
            },
            name: {
                S: data.name,
            },
            deletedAt: data.deletedAt
                ? {
                    S: data.deletedAt,
                }
                : undefined,
        },
    };

    // @ts-ignore
    await db.putItem(params).promise();
};

export const getAllByApplication = async (
    application: string,
    filter: Filter,
) => {
    let result;

    try {
        result = await db.query({
            TableName: tableNames.collections,
            ConsistentRead: AWS_DYNAMODB_CONSISTENT_READ,
            ExpressionAttributeValues: {
                ':application': {
                    S: application,
                },
            },
            KeyConditionExpression: 'application = :application',
        }).promise();
    } catch (error) {
        throw new Error(error);
    }

    const items = get(result, 'Items', []);

    return filterItems('userCollectionVersion', filter, items);
};

export const getAllByUser = async (
    application: string,
    user: string,
    filter: Filter,
) => {
    const namePartial = getCollectionRangeKey(user);

    let results;

    try {
        results = await find(application, namePartial);
    } catch (error) {

        console.error(error);



        throw new Error(error);
    }

    return filterItems('userCollectionVersion', filter, results);
};

export const findLatest = async (
    application: string,
    user: string,
    uuid: string,
    filter: Filter,
) => {
    const namePartial = getCollectionRangeKey(user, uuid);

    const results = await find(application, namePartial);

    if (filter === 'latest') {
        const latest = last(results);
        if (latest && latest.deletedAt) {
            return [];
        }
        return [latest];
    }

    if (filter === 'current') {
        return [last(results)];
    }

    return results;
};

export const update = async (
    application: string,
    user: string,
    uuid: string,
    data: {
        deletedAt?: string | undefined,
        name: string,
    },
) => {
    const appendVersion = true;
    const sortKey = getCollectionRangeKey(user, uuid, appendVersion);

    await put(application, sortKey, data);
};

export const create = async (
    application: string,
    user: string,
    data: {
        deletedAt?: string | undefined,
        name: string,
    },
) => {
    const appendVersion = true;
    const sortKey = getCollectionRangeKey(user, uuidV4(), appendVersion);

    await put(application, sortKey, data);
};

export const remove = async (
    application: string,
    user: string,
    uuid: string,
) => {
    const results = await findLatest(application, user, uuid, 'latest');
    const collection = last(results);

    if (isEmpty(collection)) {
        throw new Error('Not found');
    }

    const version = get(collection, 'userCollectionVersion.S');
    const name = get(collection, 'name.S');

    if (!version) {
        throw new Error('collection.userCollectionVersion.S undefined');
    }
    if (typeof version !== 'string') {
        throw new Error('collection.userCollectionVersion.S invalid type');
    }
    if (!name) {
        throw new Error('collection.name.S undefined');
    }
    if (typeof name !== 'string') {
        throw new Error('collection.name.S invalid type');
    }

    await put(application, version, {
        name,
        deletedAt: new Date().toISOString(),
    });
};
