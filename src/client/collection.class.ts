import { AxiosInstance } from 'axios';
import lodashGet from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import Entry, { EntryRawType } from './entry.class';

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

export class Collection {
    api: AxiosInstance;
    deletedAt: string | null = null;
    meta: CollectionMetaType;
    path: string;
    name: string;

    constructor({
        api,
        collectionRaw,
    }: CollectionParamsType) {
        const {
            meta: {
                application,
                collection,
                user,
                version,
            },
            name,
        } = collectionRaw;

        this.api = api;

        this.meta = {
            application,
            collection,
            user,
            version,
        };
        this.path = `/user/${user}/collection/${collection}`;
        this.name = name;
    }

    async getEntry(params: {
        entry: string;
        filter?: 'latest' | 'current';
    }) {
        const filter = lodashGet(params, 'filter', 'latest');

        const basePath = `${this.path}/entry`;
        const path = `${basePath}/${params.entry}`;

        return this.api
            .get(path, {
                params: {
                    filter,
                },
            })
            .then((response) => response.data)
            .then((rawEntries) => rawEntries.map((entryRaw: EntryRawType) => new Entry({
                api: this.api,
                basePath,
                entryRaw,
            })));
    }

    async getEntries(params?: {
        filter?: 'latest' | 'current';
    }) {
        const filter = lodashGet(params, 'filter', 'latest');
        const basePath = `${this.path}/entry`;
        return this.api
            .get(basePath, {
                params: {
                    filter,
                },
            })
            .then((response) => response.data)
            .then((rawEntries) => rawEntries.map((entryRaw: EntryRawType) => new Entry({
                api: this.api,
                basePath,
                entryRaw,
            })))
            .catch((error) => {
                throw new Error(error);
            });
    }

    async createEntry(params: {
        name: string;
        value: {};
    }) {
        return this.api({
            method: 'post',
            data: params,
            url: `${this.path}/entry`,
        }).catch((error) => {
            throw new Error(error);
        });
    }

    async addEntry(params: {
        name: string;
        value: {};
    }) {
        const {
            name,
            value,
        } = params;
        let entries: Array<{
            name: string;
        }>;

        entries = await this.getEntries();

        if (!isEmpty(entries)) {
            if (entries.some((c) => c.name === name)) {
                return await entries.find((c) => c.name === name);
            }
        }

        await this.createEntry({ name, value });

        entries = await this.getEntries();

        if (!isEmpty(entries)) {
            return await entries.find((c) => c.name === name);
        }

        return Promise.reject();
    }

    async update(params: {
        name: string;
    }) {
        this.name = params.name;

        return this.api
            .put(this.path, {
                name: params.name,
            })
            .catch((error) => {
                throw new Error(error);
            });
    }

    async destroy() {
        this.deletedAt = new Date().toISOString();

        return this.api.delete(this.path).catch((error) => {
            throw new Error(error);
        });
    }
}

export default Collection;
