import { CollectionRaw } from './types';
export declare const getCollectionRangeKey: (user: string, uuid?: string, createVersion?: boolean) => string;
export declare const prettifyCollection: (raw: CollectionRaw) => {
    meta: {
        application: any;
        user: any;
        collection: any;
        version: number;
        deletedAt: any;
    };
    name: any;
};
