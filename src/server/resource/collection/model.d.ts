export declare const collectionsTable: {
    AttributeDefinitions: {
        AttributeName: string;
        AttributeType: string;
    }[];
    KeySchema: {
        AttributeName: string;
        KeyType: string;
    }[];
    ProvisionedThroughput: {
        ReadCapacityUnits: number;
        WriteCapacityUnits: number;
    };
    TableName: string;
    StreamSpecification: {
        StreamEnabled: boolean;
    };
};
