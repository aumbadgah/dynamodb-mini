import { AxiosInstance } from 'axios';

export interface EntryMetaType {
    entry: string;
}

export interface EntryRawType {
    meta: {
        entry: string;
    }
    name: string;
    value: any;
}

export interface EntryParamsType {
    api: AxiosInstance;
    basePath: string;
    entryRaw: EntryRawType;
}

export class Entry {
    api: AxiosInstance;
    deletedAt: string | null = null;
    meta: EntryMetaType;
    path: string;
    name: string;
    value: {};

    constructor({
        api,
        entryRaw,
        basePath,
    }: EntryParamsType) {
        const {
            meta: {
                entry,
            },
            name,
            value,
        } = entryRaw;

        this.meta = {
            entry,
        };
        this.name = name;
        this.value = value;

        this.api = api;
        this.path = `${basePath}/${entry}`;
    }

    async update(params: {
        name: string;
        value: {};
    }) {
        this.name = params.name || this.name;
        this.value = params.value || this.value;

        return this.api.put(this.path, {
            name: params.name,
            value: params.value,
        }).catch((error) => {
            throw new Error(error);
        });
    };

    async destroy() {
        this.deletedAt = new Date().toISOString();

        return this.api.delete(this.path).catch((error) => {
            throw new Error(error);
        });
    }
}

export default Entry;
