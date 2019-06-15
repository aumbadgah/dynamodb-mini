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
var merge_1 = __importDefault(require("lodash/merge"));
var aws_sdk_1 = __importDefault(require("aws-sdk"));
var config_1 = __importDefault(require("./config"));
var model_1 = require("./resource/collection/model");
var model_2 = require("./resource/entry/model");
aws_sdk_1.default.config.update({
    region: config_1.default.AWS_REGION,
});
var dynamoOptions = {
    apiVersion: '2012-08-10',
};
if (config_1.default.dynamoOptions) {
    dynamoOptions = merge_1.default({}, dynamoOptions, config_1.default.dynamoOptions);
}
var dynamo = new aws_sdk_1.default.DynamoDB(dynamoOptions);
var localTables = [model_1.collectionsTable, model_2.entriesTable];
var listTables = function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
    return [2 /*return*/, dynamo.listTables().promise()];
}); }); };
var describeTables = function (tables) { return Promise.all(tables.map(function (table) { return dynamo.describeTable({
    TableName: table,
}).promise(); })); };
var init = function () { return __awaiter(_this, void 0, void 0, function () {
    var list, tables, logTableStatus, createTable;
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('DB ::: listTables');
                return [4 /*yield*/, listTables()];
            case 1:
                list = _a.sent();
                if (config_1.default.DEBUG) {
                    console.log(JSON.stringify(list, null, 2));
                }
                console.log('DB ::: describeTables');
                if (!list.TableNames) {
                    throw new Error('listTables returned undefined');
                }
                return [4 /*yield*/, describeTables(list.TableNames)];
            case 2:
                tables = _a.sent();
                if (config_1.default.DEBUG) {
                    console.log(JSON.stringify(tables, null, 2));
                }
                logTableStatus = function (status, tableName) {
                    console.log("DB status ::: " + tableName + " ::: " + status);
                };
                tables.forEach(function (table) {
                    var localTable = localTables
                        .find(function (locTable) { return !!table.Table && locTable.TableName === table.Table.TableName; });
                    if (localTable) {
                        var isAttributesIdentical = function (local, remote) { return remote && remote.Table && remote.Table.AttributeDefinitions && local.AttributeDefinitions.toString() === remote.Table.AttributeDefinitions.toString(); };
                        var isKeysIdentical = function (local, remote) { return remote && remote.Table && remote.Table.KeySchema && local.KeySchema.toString() === remote.Table.KeySchema.toString(); };
                        if (isAttributesIdentical(localTable, table) && isKeysIdentical(localTable, table)) {
                            logTableStatus('OK', localTable.TableName);
                        }
                        else {
                            logTableStatus('LOCAL AND REMOTE DEFINITIONS ARE NOT IDENTICAL', localTable.TableName);
                        }
                    }
                    else if (table.Table && table.Table.TableName) {
                        logTableStatus('MISSING LOCAL DEFINITION', table.Table.TableName);
                    }
                });
                createTable = function (localTable) { return __awaiter(_this, void 0, void 0, function () {
                    var tableCreateResult;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                logTableStatus('MISSING REMOTE DEFINITION', localTable.TableName);
                                return [4 /*yield*/, dynamo.createTable(localTable).promise()];
                            case 1:
                                tableCreateResult = _a.sent();
                                logTableStatus('CREATED', localTable.TableName);
                                console.log(JSON.stringify(tableCreateResult, null, 2));
                                return [2 /*return*/];
                        }
                    });
                }); };
                return [4 /*yield*/, localTables
                        .filter(function (localTable) { return !tables.some(function (table) { return !!table && !!table.Table && table.Table.TableName === localTable.TableName; }); })
                        .map(function (localTable) { return createTable(localTable); })];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var db = {
    init: init,
    listTables: listTables,
    describeTables: describeTables,
    deleteItem: dynamo.deleteItem.bind(dynamo),
    getItem: dynamo.getItem.bind(dynamo),
    putItem: dynamo.putItem.bind(dynamo),
    query: dynamo.query.bind(dynamo),
};
exports.default = db;
