export declare const entriesTable: {
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
