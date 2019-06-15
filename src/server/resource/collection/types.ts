export type CollectionMeta = {
    application: string,
    user: string,
    collection: string,
    version: number,
    deletedAt?: string,
};

export type CollectionInput = {
    name: string,
    deletedAt?: string,
};

export type CollectionRaw = {
    application: {
        S: string,
    },
    userCollectionVersion: {
        S: string,
    },
    name: {
        S: string,
    },
    deletedAt?: {
        S: string,
    },
};

export type CollectionPretty = {
    meta: CollectionMeta,
    name: string,
};
