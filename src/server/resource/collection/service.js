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
var isEmpty_1 = __importDefault(require("lodash/isEmpty"));
var get_1 = __importDefault(require("lodash/get"));
var last_1 = __importDefault(require("lodash/last"));
var v4_1 = __importDefault(require("uuid/v4"));
var config_1 = __importDefault(require("../../config"));
var db_1 = __importDefault(require("../../db"));
var filterItems_1 = __importDefault(require("../../util/filterItems"));
var util_1 = require("./util");
var AWS_DYNAMODB_CONSISTENT_READ = config_1.default.AWS_DYNAMODB_CONSISTENT_READ, tableNames = config_1.default.tableNames;
var find = function (application, namePartial, options) { return __awaiter(_this, void 0, void 0, function () {
    var query, results, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                query = {
                    TableName: tableNames.collections,
                    ConsistentRead: AWS_DYNAMODB_CONSISTENT_READ,
                    ExpressionAttributeValues: {
                        ':application': {
                            S: application,
                        },
                        ':namePartial': {
                            S: namePartial,
                        },
                    },
                    KeyConditionExpression: 'application = :application and begins_with(userCollectionVersion, :namePartial)',
                };
                if (!isEmpty_1.default(options)) {
                    Object.assign(query, options);
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, db_1.default.query(query).promise()];
            case 2:
                results = _a.sent();
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                throw new Error(error_1);
            case 4: return [2 /*return*/, get_1.default(results, 'Items', [])];
        }
    });
}); };
var put = function (application, userCollectionVersion, data) { return __awaiter(_this, void 0, void 0, function () {
    var params;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                params = {
                    TableName: tableNames.collections,
                    Item: {
                        application: {
                            S: application,
                        },
                        userCollectionVersion: {
                            S: userCollectionVersion,
                        },
                        name: {
                            S: data.name,
                        },
                        deletedAt: data.deletedAt
                            ? {
                                S: data.deletedAt,
                            }
                            : undefined,
                    },
                };
                // @ts-ignore
                return [4 /*yield*/, db_1.default.putItem(params).promise()];
            case 1:
                // @ts-ignore
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.getAllByApplication = function (application, filter) { return __awaiter(_this, void 0, void 0, function () {
    var result, error_2, items;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.default.query({
                        TableName: tableNames.collections,
                        ConsistentRead: AWS_DYNAMODB_CONSISTENT_READ,
                        ExpressionAttributeValues: {
                            ':application': {
                                S: application,
                            },
                        },
                        KeyConditionExpression: 'application = :application',
                    }).promise()];
            case 1:
                result = _a.sent();
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                throw new Error(error_2);
            case 3:
                items = get_1.default(result, 'Items', []);
                return [2 /*return*/, filterItems_1.default('userCollectionVersion', filter, items)];
        }
    });
}); };
exports.getAllByUser = function (application, user, filter) { return __awaiter(_this, void 0, void 0, function () {
    var namePartial, results, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                namePartial = util_1.getCollectionRangeKey(user);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, find(application, namePartial)];
            case 2:
                results = _a.sent();
                return [3 /*break*/, 4];
            case 3:
                error_3 = _a.sent();
                console.error(error_3);
                throw new Error(error_3);
            case 4: return [2 /*return*/, filterItems_1.default('userCollectionVersion', filter, results)];
        }
    });
}); };
exports.findLatest = function (application, user, uuid, filter) { return __awaiter(_this, void 0, void 0, function () {
    var namePartial, results, latest;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                namePartial = util_1.getCollectionRangeKey(user, uuid);
                return [4 /*yield*/, find(application, namePartial)];
            case 1:
                results = _a.sent();
                if (filter === 'latest') {
                    latest = last_1.default(results);
                    if (latest && latest.deletedAt) {
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
exports.update = function (application, user, uuid, data) { return __awaiter(_this, void 0, void 0, function () {
    var appendVersion, sortKey;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                appendVersion = true;
                sortKey = util_1.getCollectionRangeKey(user, uuid, appendVersion);
                return [4 /*yield*/, put(application, sortKey, data)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.create = function (application, user, data) { return __awaiter(_this, void 0, void 0, function () {
    var appendVersion, sortKey;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                appendVersion = true;
                sortKey = util_1.getCollectionRangeKey(user, v4_1.default(), appendVersion);
                return [4 /*yield*/, put(application, sortKey, data)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.remove = function (application, user, uuid) { return __awaiter(_this, void 0, void 0, function () {
    var results, collection, version, name;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.findLatest(application, user, uuid, 'latest')];
            case 1:
                results = _a.sent();
                collection = last_1.default(results);
                if (isEmpty_1.default(collection)) {
                    throw new Error('Not found');
                }
                version = get_1.default(collection, 'userCollectionVersion.S');
                name = get_1.default(collection, 'name.S');
                if (!version) {
                    throw new Error('collection.userCollectionVersion.S undefined');
                }
                if (typeof version !== 'string') {
                    throw new Error('collection.userCollectionVersion.S invalid type');
                }
                if (!name) {
                    throw new Error('collection.name.S undefined');
                }
                if (typeof name !== 'string') {
                    throw new Error('collection.name.S invalid type');
                }
                return [4 /*yield*/, put(application, version, {
                        name: name,
                        deletedAt: new Date().toISOString(),
                    })];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
