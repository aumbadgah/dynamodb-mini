import isEmpty from 'lodash/isEmpty';
import slugify from 'slugify';

import { CollectionRaw } from './types';

export const getCollectionRangeKey = (
    user: string,
    uuid: string = '',
    createVersion: boolean = false,
) => {
    let name = `${slugify(user)}#`;

    if (!isEmpty(uuid)) {
        name += `${slugify(uuid)}#`;

        if (createVersion) {
            name += `${Date.now().toString()}`;
        }
    }

    return name;
};

export const prettifyCollection = (raw: CollectionRaw) => {
    const userCollectionVersion = raw.userCollectionVersion.S;

    const versionStartIndex = userCollectionVersion.lastIndexOf('#');
    const collectionStartIndex = userCollectionVersion.lastIndexOf('#', (versionStartIndex - 1));

    return {
        meta: {
            application: raw.application.S,
            user: userCollectionVersion.slice(0, collectionStartIndex),
            collection: userCollectionVersion.slice((collectionStartIndex + 1), versionStartIndex),
            version: parseInt(userCollectionVersion.slice((versionStartIndex + 1)), 10),
            deletedAt: raw.deletedAt
                ? raw.deletedAt.S
                : undefined,
        },
        name: raw.name.S,
    };
};
