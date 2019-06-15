import { CreateTableInput, DescribeTableOutput } from 'aws-sdk/clients/dynamodb';
import merge from 'lodash/merge';
import AWS from 'aws-sdk';

import config from './config';
import { collectionsTable } from './resource/collection/model';
import { entriesTable } from './resource/entry/model';

export type TableList = {
    TableNames: string[],
};

AWS.config.update({
    region: config.AWS_REGION,
});

let dynamoOptions = {
    apiVersion: '2012-08-10',
};
if (config.dynamoOptions) {
    dynamoOptions = merge({}, dynamoOptions, config.dynamoOptions);
}
const dynamo = new AWS.DynamoDB(dynamoOptions);

const localTables = [collectionsTable, entriesTable];

const listTables = async () => dynamo.listTables().promise();

const describeTables = (tables: string[]) => Promise.all(tables.map((table: string) => dynamo.describeTable({
    TableName: table,
}).promise()));

const init = async () => {
    console.log('DB ::: listTables');
    const list = await listTables();
    if (config.DEBUG) {
        console.log(JSON.stringify(list, null, 2));
    }

    console.log('DB ::: describeTables');
    if (!list.TableNames) {
        throw new Error('listTables returned undefined');
    }
    const tables = await describeTables(list.TableNames);
    if (config.DEBUG) {
        console.log(JSON.stringify(tables, null, 2));
    }

    const logTableStatus = (status: string, tableName: string) => {
        console.log(`DB status ::: ${tableName} ::: ${status}`);
    };

    tables.forEach((table) => {
        const localTable = localTables
            .find((locTable) => !!table.Table && locTable.TableName === table.Table.TableName);
        if (localTable) {
            const isAttributesIdentical = (
                local: CreateTableInput,
                remote: DescribeTableOutput,
            ) => remote && remote.Table && remote.Table.AttributeDefinitions && local.AttributeDefinitions.toString() === remote.Table.AttributeDefinitions.toString();
            const isKeysIdentical = (
                local: CreateTableInput,
                remote: DescribeTableOutput,
            ) => remote && remote.Table && remote.Table.KeySchema && local.KeySchema.toString() === remote.Table.KeySchema.toString();

            if (isAttributesIdentical(localTable, table) && isKeysIdentical(localTable, table)) {
                logTableStatus('OK', localTable.TableName);
            } else {
                logTableStatus('LOCAL AND REMOTE DEFINITIONS ARE NOT IDENTICAL', localTable.TableName);
            }
        } else if (table.Table && table.Table.TableName) {
            logTableStatus('MISSING LOCAL DEFINITION', table.Table.TableName);
        }
    });

    const createTable = async (localTable: CreateTableInput) => {
        logTableStatus('MISSING REMOTE DEFINITION', localTable.TableName);
        const tableCreateResult = await dynamo.createTable(localTable).promise();
        logTableStatus('CREATED', localTable.TableName);
        console.log(JSON.stringify(tableCreateResult, null, 2));
    };

    await localTables
        .filter((localTable) => !tables.some((table) => !!table && !!table.Table && table.Table.TableName === localTable.TableName))
        .map((localTable) => createTable(localTable));
};

const db = {
    init,
    listTables,
    describeTables,

    deleteItem: dynamo.deleteItem.bind(dynamo),
    getItem: dynamo.getItem.bind(dynamo),
    putItem: dynamo.putItem.bind(dynamo),
    query: dynamo.query.bind(dynamo),
};

export default db;
