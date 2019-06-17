"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var last_1 = __importDefault(require("lodash/last"));
var isEmpty_1 = __importDefault(require("lodash/isEmpty"));
var v4_1 = __importDefault(require("uuid/v4"));
var get_1 = __importDefault(require("lodash/get"));
var config_1 = __importDefault(require("../../config"));
var db_1 = __importDefault(require("../../db"));
var filterItems_1 = __importDefault(require("../../util/filterItems"));
var util_1 = require("../collection/util");
var util_2 = require("./util");
var AWS_DYNAMODB_CONSISTENT_READ = config_1.default.AWS_DYNAMODB_CONSISTENT_READ, tableNames = config_1.default.tableNames;
exports.getAllByUserCollection = function (user, collection, filter) { return __awaiter(_this, void 0, void 0, function () {
    var hashKey, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                hashKey = util_1.getCollectionRangeKey(user, collection);
                return [4 /*yield*/, db_1.default.query({
                        TableName: tableNames.entries,
                        ConsistentRead: AWS_DYNAMODB_CONSISTENT_READ,
                        ExpressionAttributeValues: {
                            ':hashKey': {
                                S: hashKey,
                            },
                        },
                        KeyConditionExpression: 'userCollection = :hashKey',
                    }).promise()];
            case 1:
                result = _a.sent();
                if (!result.Items) {
                    return [2 /*return*/, Promise.resolve([])];
                }
                return [2 /*return*/, filterItems_1.default('entryVersion', filter, result.Items)];
        }
    });
}); };
var find = function (hashKey, sortKeyPartial, options) { return __awaiter(_this, void 0, void 0, function () {
    var query, results;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                query = {
                    TableName: tableNames.entries,
                    ConsistentRead: AWS_DYNAMODB_CONSISTENT_READ,
                    ExpressionAttributeValues: {
                        ':hashKey': {
                            S: hashKey,
                        },
                        ':sortKeyPartial': {
                            S: sortKeyPartial,
                        },
                    },
                    KeyConditionExpression: 'userCollection = :hashKey and begins_with(entryVersion, :sortKeyPartial)',
                };
                if (!isEmpty_1.default(options)) {
                    Object.assign(query, options);
                }
                return [4 /*yield*/, db_1.default.query(query).promise()];
            case 1:
                results = _a.sent();
                return [2 /*return*/, results.Items];
        }
    });
}); };
;
var validateString = function (value) {
    if (!isEmpty_1.default(value) && !(typeof value === 'string' || value instanceof String)) {
        throw new Error('Invalid entry name');
    }
};
var put = function (userCollection, entryVersion, data) { return __awaiter(_this, void 0, void 0, function () {
    var name, value, deletedAt;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                name = data.name, value = data.value, deletedAt = data.deletedAt;
                if (isEmpty_1.default(name) && isEmpty_1.default(value)) {
                    throw new Error('Entry name or value required');
                }
                validateString(name);
                validateString(value);
                return [4 /*yield*/, db_1.default.putItem({
                        // @ts-ignore: Unreachable code error
                        TableName: tableNames.entries,
                        Item: {
                            userCollection: {
                                S: userCollection,
                            },
                            entryVersion: {
                                S: entryVersion,
                            },
                            name: name
                                ? {
                                    S: name,
                                }
                                : undefined,
                            value: value
                                ? {
                                    S: value,
                                }
                                : undefined,
                            deletedAt: deletedAt
                                ? {
                                    S: deletedAt,
                                }
                                : undefined,
                        },
                    }).promise()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.findLatest = function (user, collection, uuid, filter) { return __awaiter(_this, void 0, void 0, function () {
    var hashKey, sortKeyPartial, results, latest;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                hashKey = util_1.getCollectionRangeKey(user, collection);
                sortKeyPartial = util_2.getEntryRangeKey(uuid);
                return [4 /*yield*/, find(hashKey, sortKeyPartial)];
            case 1:
                results = _a.sent();
                if (filter === 'latest') {
                    latest = last_1.default(results);
                    if (!latest || latest.deletedAt) {
                        return [2 /*return*/, []];
                    }
                    return [2 /*return*/, [latest]];
                }
                if (filter === 'current') {
                    return [2 /*return*/, [last_1.default(results)]];
                }
                return [2 /*return*/, results];
        }
    });
}); };
exports.create = function (user, collection, data) { return __awaiter(_this, void 0, void 0, function () {
    var hashKey, appendVersion, sortKey, name, value;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                hashKey = util_1.getCollectionRangeKey(user, collection);
                appendVersion = true;
                sortKey = util_2.getEntryRangeKey(v4_1.default(), appendVersion);
                name = data.name, value = data.value;
                return [4 /*yield*/, put(hashKey, sortKey, {
                        name: name,
                        value: value
                            ? JSON.stringify(value)
                            : undefined,
                    })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.update = function (user, collection, entry, data) { return __awaiter(_this, void 0, void 0, function () {
    var hashKey, appendVersion, sortKey, name, value;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                hashKey = util_1.getCollectionRangeKey(user, collection);
                appendVersion = true;
                sortKey = util_2.getEntryRangeKey(entry, appendVersion);
                name = data.name, value = data.value;
                return [4 /*yield*/, put(hashKey, sortKey, {
                        name: name,
                        value: value
                            ? JSON.stringify(value)
                            : undefined,
                    })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.remove = function (user, collection, entryUuid) { return __awaiter(_this, void 0, void 0, function () {
    var results, entry, deletedEntry, collectionId, version;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.findLatest(user, collection, entryUuid, 'latest')];
            case 1:
                results = _a.sent();
                entry = last_1.default(results);
                if (isEmpty_1.default(entry)) {
                    throw new Error('Not found');
                }
                deletedEntry = {
                    value: get_1.default(entry, 'value.S'),
                    deletedAt: new Date().toISOString(),
                    name: get_1.default(entry, 'name.S', ''),
                };
                collectionId = get_1.default(entry, 'userCollection.S');
                version = get_1.default(entry, 'entryVersion.S');
                validateString(collectionId);
                validateString(version);
                // @ts-ignore
                return [4 /*yield*/, put(collectionId, version, deletedEntry)];
            case 2:
                // @ts-ignore
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
