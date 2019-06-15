import { AttributeMap } from 'aws-sdk/clients/dynamodb';
export declare type Filter = 'all' | 'latest' | 'current';
declare const filterItems: (keyName: string, filter: Filter, items: AttributeMap[]) => (({
    deletedAt?: {
        S: string;
    } | undefined;
} & AttributeMap) | undefined)[];
export default filterItems;
