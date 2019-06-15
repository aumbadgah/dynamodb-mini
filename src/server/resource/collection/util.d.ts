import { CollectionRaw } from './types';
export declare const getCollectionRangeKey: (user: string, uuid?: string, createVersion?: boolean) => string;
export declare const prettifyCollection: (raw: CollectionRaw) => {
    meta: {
        application: string;
        user: string;
        collection: string;
        version: number;
        deletedAt: string | undefined;
    };
    name: string;
};
