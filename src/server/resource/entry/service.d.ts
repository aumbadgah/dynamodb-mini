import { Filter } from '../../util/filterItems';
export declare const getAllByUserCollection: (user: string, collection: string, filter: Filter) => Promise<(({
    deletedAt?: {
        S: string;
    } | undefined;
} & import("aws-sdk/clients/dynamodb").AttributeMap) | undefined)[]>;
interface EntryInput {
    deletedAt?: string;
    name?: string;
    value?: string;
}
export declare const findLatest: (user: string, collection: string, uuid: string, filter: string) => Promise<(import("aws-sdk/clients/dynamodb").AttributeMap | undefined)[] | undefined>;
export declare const create: (user: string, collection: string, data: EntryInput) => Promise<void>;
export declare const update: (user: string, collection: string, entry: string, data: EntryInput) => Promise<void>;
export declare const remove: (user: string, collection: string, entryUuid: string) => Promise<void>;
export {};
