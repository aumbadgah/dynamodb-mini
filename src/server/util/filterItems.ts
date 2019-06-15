import { AttributeMap } from 'aws-sdk/clients/dynamodb';
import { ItemList } from 'aws-sdk/clients/dynamodb';
import groupBy from 'lodash/groupBy';
import last from 'lodash/last';

export type Filter = 'all' | 'latest' | 'current';

const groupByKeyWithoutVersion = (keyName: string, items: ItemList) => groupBy(items, (item) => {
    // @ts-ignore
    if (!item || !item[keyName] || !item[keyName].S || !item[keyName].S.includes('#')) {
        throw new Error(`Invalid AttributeMap[${keyName}].S`);
    }
    // @ts-ignore
    const versionStartIndex = item[keyName].S.lastIndexOf('#');
    // @ts-ignore
    return item[keyName].S.slice(0, versionStartIndex);
});

const filterItems = (keyName: string, filter: Filter, items: ItemList): (({
    deletedAt?: {
        S: string,
    }
} & AttributeMap) | undefined)[] => {
    const groupedItems = groupByKeyWithoutVersion(keyName, items);

    if (filter === 'latest') {
        return Object.values(groupedItems)
            .map((version) => last(version))
            .filter((latest) => latest && !latest.deletedAt);
    }

    if (filter === 'current') {
        return Object.values(groupedItems)
            .map((version) => last(version));
    }

    return items;
};

export default filterItems;
