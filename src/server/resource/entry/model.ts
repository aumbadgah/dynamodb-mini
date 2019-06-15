import config from '../../config';

const {
    AWS_DYNAMODB_READ_CAPACITY_UNITS,
    AWS_DYNAMODB_WRITE_CAPACITY_UNITS,
    tableNames,
} = config;

export const entriesTable = {
    AttributeDefinitions: [
        {
            AttributeName: 'userCollection',
            AttributeType: 'S',
        },
        {
            AttributeName: 'entryVersion',
            AttributeType: 'S',
        },
    ],
    KeySchema: [
        {
            AttributeName: 'userCollection',
            KeyType: 'HASH',
        },
        {
            AttributeName: 'entryVersion',
            KeyType: 'RANGE',
        },
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: AWS_DYNAMODB_READ_CAPACITY_UNITS,
        WriteCapacityUnits: AWS_DYNAMODB_WRITE_CAPACITY_UNITS,
    },
    TableName: tableNames.entries,
    StreamSpecification: {
        StreamEnabled: false,
    },
};
