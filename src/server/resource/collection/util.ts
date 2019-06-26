import get from 'lodash/get';
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
    const userCollectionVersion = get(raw, 'userCollectionVersion.S');

    const versionStartIndex = userCollectionVersion.lastIndexOf('#');
    const collectionStartIndex = userCollectionVersion.lastIndexOf('#', (versionStartIndex - 1));

    const application = get(raw, 'application.S');
    const user = userCollectionVersion.slice(0, collectionStartIndex);
    const collection = userCollectionVersion.slice((collectionStartIndex + 1), versionStartIndex);
    const version = parseInt(userCollectionVersion.slice((versionStartIndex + 1)), 10);
    const deletedAt = get(raw, 'deletedAt.S');
    
    const name = get(raw, 'name.S');

    return {
        meta: {
            application,
            user,
            collection,
            version,
            deletedAt,
        },
        name,
    };
};
