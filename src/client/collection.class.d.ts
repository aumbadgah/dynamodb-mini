import { AxiosInstance } from 'axios';
export interface CollectionMetaType {
    application: string;
    collection: string;
    user: string;
    version: string;
}
export interface CollectionRawType {
    meta: CollectionMetaType;
    name: string;
}
export interface CollectionParamsType {
    api: AxiosInstance;
    collectionRaw: CollectionRawType;
}
export declare class Collection {
    api: AxiosInstance;
    deletedAt: string | null;
    meta: CollectionMetaType;
    path: string;
    name: string;
    constructor({ api, collectionRaw, }: CollectionParamsType);
    getEntry(params: {
        entry: string;
        filter?: 'latest' | 'current';
    }): Promise<any>;
    getEntries(params?: {
        filter?: 'latest' | 'current';
    }): Promise<any>;
    createEntry(params: {
        name: string;
        value: {};
    }): Promise<import("axios").AxiosResponse<any>>;
    addEntry(params: {
        name: string;
        value: {};
    }): Promise<{
        name: string;
    } | undefined>;
    update(params: {
        name: string;
    }): Promise<import("axios").AxiosResponse<any>>;
    destroy(): Promise<import("axios").AxiosResponse<any>>;
}
export default Collection;
