export declare type EntryInput = {
    name?: string;
    value?: Object;
};
export interface EntryRaw {
    userCollection: {
        S: string;
    };
    entryVersion: {
        S: string;
    };
    name?: {
        S: string;
    };
    value?: {
        S: string;
    };
    deletedAt?: {
        S: string;
    };
}
export interface EntryPretty {
    meta: {
        user: string;
        collection: string;
        entry: string;
        version: number;
        deletedAt?: string;
    };
    name?: string;
    value?: Object;
}
