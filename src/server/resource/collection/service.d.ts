import { Filter } from '../../util/filterItems';
export declare const getAllByApplication: (application: string, filter: Filter) => Promise<(({
    deletedAt?: {
        S: string;
    } | undefined;
} & import("aws-sdk/clients/dynamodb").AttributeMap) | undefined)[]>;
export declare const getAllByUser: (application: string, user: string, filter: Filter) => Promise<(({
    deletedAt?: {
        S: string;
    } | undefined;
} & import("aws-sdk/clients/dynamodb").AttributeMap) | undefined)[]>;
export declare const findLatest: (application: string, user: string, uuid: string, filter: Filter) => Promise<(import("aws-sdk/clients/dynamodb").AttributeMap | undefined)[]>;
export declare const update: (application: string, user: string, uuid: string, data: {
    deletedAt?: string | undefined;
    name: string;
}) => Promise<void>;
export declare const create: (application: string, user: string, data: {
    deletedAt?: string | undefined;
    name: string;
}) => Promise<void>;
export declare const remove: (application: string, user: string, uuid: string) => Promise<void>;
