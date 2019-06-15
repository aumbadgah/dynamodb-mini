export declare type CollectionMeta = {
    application: string;
    user: string;
    collection: string;
    version: number;
    deletedAt?: string;
};
export declare type CollectionInput = {
    name: string;
    deletedAt?: string;
};
export declare type CollectionRaw = {
    application: {
        S: string;
    };
    userCollectionVersion: {
        S: string;
    };
    name: {
        S: string;
    };
    deletedAt?: {
        S: string;
    };
};
export declare type CollectionPretty = {
    meta: CollectionMeta;
    name: string;
};
