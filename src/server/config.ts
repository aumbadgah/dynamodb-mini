import fs from 'fs';

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

const {
    AWS_REGION,
    AWS_DYNAMODB_CONSISTENT_READ,
    AWS_DYNAMODB_READ_CAPACITY_UNITS,
    AWS_DYNAMODB_WRITE_CAPACITY_UNITS,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_SESSION_TOKEN,
    DEBUG,
    AWS_DYNAMODB_RETRY_BASE_DELAY,
    PORT,
    TABLE_NAME_COLLECTIONS,
    TABLE_NAME_ENTRIES,
} = process.env;

if (!AWS_REGION) {
    throw new Error('Missing reduired property AWS_REGION');
}

const config: ConfigType = {
    API_KEYS: [],
    AWS_REGION,
    AWS_DYNAMODB_READ_CAPACITY_UNITS: parseInt(AWS_DYNAMODB_READ_CAPACITY_UNITS || '1', 10) || 1,
    AWS_DYNAMODB_WRITE_CAPACITY_UNITS: parseInt(AWS_DYNAMODB_WRITE_CAPACITY_UNITS || '1', 10) || 1,
    AWS_DYNAMODB_CONSISTENT_READ: (AWS_DYNAMODB_CONSISTENT_READ || 'true') === 'true',
    DEBUG: DEBUG === 'true',
    PORT: PORT || 3000,
    tableNames: {
        collections: TABLE_NAME_COLLECTIONS || 'dynamomini.collections',
        entries: TABLE_NAME_ENTRIES || 'dynamomini.entries',
    },
};

if (AWS_DYNAMODB_RETRY_BASE_DELAY) {
    config.dynamoOptions = {
        retryDelayOptions: {
            base: AWS_DYNAMODB_RETRY_BASE_DELAY,
        },
    };
}

config.API_KEYS = JSON.parse(fs.readFileSync('./env/api-keys.json', {
    encoding: 'utf8',
}));

if (config.DEBUG) {
    console.log('DEBUG aws-sdk required envs');
    console.log(`   AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID || 'undefined'}`);
    console.log(`   AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY || 'undefined'}`);
    console.log(`   AWS_SESSION_TOKEN (optional): ${AWS_SESSION_TOKEN || 'undefined'}`);

    console.log('DEBUG config');
    console.log(JSON.stringify(config, null, 2));
}

export default config;
