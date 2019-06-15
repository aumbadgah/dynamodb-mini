import { DescribeTableOutput } from 'aws-sdk/clients/dynamodb';
import AWS from 'aws-sdk';
export declare type TableList = {
    TableNames: string[];
};
declare const db: {
    init: () => Promise<void>;
    listTables: () => Promise<import("aws-sdk/lib/request").PromiseResult<AWS.DynamoDB.ListTablesOutput, AWS.AWSError>>;
    describeTables: (tables: string[]) => Promise<import("aws-sdk/lib/request").PromiseResult<DescribeTableOutput, AWS.AWSError>[]>;
    deleteItem: {
        (params: AWS.DynamoDB.DeleteItemInput, callback?: ((err: AWS.AWSError, data: AWS.DynamoDB.DeleteItemOutput) => void) | undefined): AWS.Request<AWS.DynamoDB.DeleteItemOutput, AWS.AWSError>;
        (callback?: ((err: AWS.AWSError, data: AWS.DynamoDB.DeleteItemOutput) => void) | undefined): AWS.Request<AWS.DynamoDB.DeleteItemOutput, AWS.AWSError>;
    };
    getItem: {
        (params: AWS.DynamoDB.GetItemInput, callback?: ((err: AWS.AWSError, data: AWS.DynamoDB.GetItemOutput) => void) | undefined): AWS.Request<AWS.DynamoDB.GetItemOutput, AWS.AWSError>;
        (callback?: ((err: AWS.AWSError, data: AWS.DynamoDB.GetItemOutput) => void) | undefined): AWS.Request<AWS.DynamoDB.GetItemOutput, AWS.AWSError>;
    };
    putItem: {
        (params: AWS.DynamoDB.PutItemInput, callback?: ((err: AWS.AWSError, data: AWS.DynamoDB.PutItemOutput) => void) | undefined): AWS.Request<AWS.DynamoDB.PutItemOutput, AWS.AWSError>;
        (callback?: ((err: AWS.AWSError, data: AWS.DynamoDB.PutItemOutput) => void) | undefined): AWS.Request<AWS.DynamoDB.PutItemOutput, AWS.AWSError>;
    };
    query: {
        (params: AWS.DynamoDB.QueryInput, callback?: ((err: AWS.AWSError, data: AWS.DynamoDB.QueryOutput) => void) | undefined): AWS.Request<AWS.DynamoDB.QueryOutput, AWS.AWSError>;
        (callback?: ((err: AWS.AWSError, data: AWS.DynamoDB.QueryOutput) => void) | undefined): AWS.Request<AWS.DynamoDB.QueryOutput, AWS.AWSError>;
    };
};
export default db;
