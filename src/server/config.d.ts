export interface ApiKeyType {
    application: string;
    key: string;
}
export interface ConfigType {
    AWS_REGION: string;
    AWS_DYNAMODB_CONSISTENT_READ: boolean;
    AWS_DYNAMODB_READ_CAPACITY_UNITS: number;
    AWS_DYNAMODB_WRITE_CAPACITY_UNITS: number;
    DEBUG: boolean;
    PORT: string | number;
    tableNames: {
        collections: string;
        entries: string;
    };
    dynamoOptions?: any;
    API_KEYS: ApiKeyType[];
}
declare const config: ConfigType;
export default config;
