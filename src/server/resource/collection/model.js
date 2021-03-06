"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = __importDefault(require("../../config"));
var AWS_DYNAMODB_READ_CAPACITY_UNITS = config_1.default.AWS_DYNAMODB_READ_CAPACITY_UNITS, AWS_DYNAMODB_WRITE_CAPACITY_UNITS = config_1.default.AWS_DYNAMODB_WRITE_CAPACITY_UNITS, tableNames = config_1.default.tableNames;
exports.collectionsTable = {
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
