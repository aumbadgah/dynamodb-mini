import config from '../../config';

const {
    AWS_DYNAMODB_READ_CAPACITY_UNITS,
    AWS_DYNAMODB_WRITE_CAPACITY_UNITS,
    tableNames,
} = config;

export const collectionsTable = {
    AttributeDefinitions: [
        {
            AttributeName: 'application',
            AttributeType: 'S',
        },
        {
            AttributeName: 'userCollectionVersion',
            AttributeType: 'S',
        },
    ],
    KeySchema: [
        {
            AttributeName: 'application',
            KeyType: 'HASH',
        },
        {
            AttributeName: 'userCollectionVersion',
            KeyType: 'RANGE',
        },
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: AWS_DYNAMODB_READ_CAPACITY_UNITS,
        WriteCapacityUnits: AWS_DYNAMODB_WRITE_CAPACITY_UNITS,
    },
    TableName: tableNames.collections,
    StreamSpecification: {
        StreamEnabled: false,
    },
};
