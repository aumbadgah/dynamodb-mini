import { AxiosInstance } from 'axios';
export interface EntryMetaType {
    entry: string;
}
export interface EntryRawType {
    meta: {
        entry: string;
    };
    name: string;
    value: any;
}
export interface EntryParamsType {
    api: AxiosInstance;
    basePath: string;
    entryRaw: EntryRawType;
}
export declare class Entry {
    api: AxiosInstance;
    deletedAt: string | null;
    meta: EntryMetaType;
    path: string;
    name: string;
    value: {};
    constructor({ api, entryRaw, basePath, }: EntryParamsType);
    update(params: {
        name: string;
        value: {};
    }): Promise<import("axios").AxiosResponse<any>>;
    destroy(): Promise<import("axios").AxiosResponse<any>>;
}
export default Entry;
