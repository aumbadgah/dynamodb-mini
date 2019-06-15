"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var _a = process.env, AWS_REGION = _a.AWS_REGION, AWS_DYNAMODB_CONSISTENT_READ = _a.AWS_DYNAMODB_CONSISTENT_READ, AWS_DYNAMODB_READ_CAPACITY_UNITS = _a.AWS_DYNAMODB_READ_CAPACITY_UNITS, AWS_DYNAMODB_WRITE_CAPACITY_UNITS = _a.AWS_DYNAMODB_WRITE_CAPACITY_UNITS, AWS_ACCESS_KEY_ID = _a.AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY = _a.AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN = _a.AWS_SESSION_TOKEN, DEBUG = _a.DEBUG, AWS_DYNAMODB_RETRY_BASE_DELAY = _a.AWS_DYNAMODB_RETRY_BASE_DELAY, PORT = _a.PORT, TABLE_NAME_COLLECTIONS = _a.TABLE_NAME_COLLECTIONS, TABLE_NAME_ENTRIES = _a.TABLE_NAME_ENTRIES;
if (!AWS_REGION) {
    throw new Error('Missing reduired property AWS_REGION');
}
var config = {
    API_KEYS: [],
    AWS_REGION: AWS_REGION,
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
config.API_KEYS = JSON.parse(fs_1.default.readFileSync('./env/api-keys.json', {
    encoding: 'utf8',
}));
if (config.DEBUG) {
    console.log('DEBUG aws-sdk required envs');
    console.log("   AWS_ACCESS_KEY_ID: " + (AWS_ACCESS_KEY_ID || 'undefined'));
    console.log("   AWS_SECRET_ACCESS_KEY: " + (AWS_SECRET_ACCESS_KEY || 'undefined'));
    console.log("   AWS_SESSION_TOKEN (optional): " + (AWS_SESSION_TOKEN || 'undefined'));
    console.log('DEBUG config');
    console.log(JSON.stringify(config, null, 2));
}
exports.default = config;
