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
var url_1 = require("url");
var axios_1 = __importDefault(require("axios"));
var get_1 = __importDefault(require("lodash/get"));
var isEmpty_1 = __importDefault(require("lodash/isEmpty"));
var merge_1 = __importDefault(require("lodash/merge"));
var collection_class_1 = __importDefault(require("./collection.class"));
exports.Store = function (params) {
    var apiSecret = params.apiSecret, baseURL = params.baseURL;
    if (isEmpty_1.default(apiSecret)) {
        throw new Error('Missing a required parameter \'apiSecret\'');
    }
    if (isEmpty_1.default(baseURL)) {
        throw new Error('Missing a required parameter \'baseURL\'');
    }
    var url = new url_1.URL('api', baseURL);
    var axiosOptions = {
        baseURL: url.toString(),
    };
    if (params.axiosOptions) {
        axiosOptions = merge_1.default({}, params.axiosOptions, axiosOptions);
    }
    var api = axios_1.default.create(axiosOptions);
    api.defaults.headers.common['x-api-key'] = apiSecret;
    var createCollection = function (params) { return api
        .post("/user/" + params.user + "/collection", {
        name: params.name,
    })
        .catch(function (error) {
        throw new Error(error);
    }); };
    var getCollections = function (params) { return __awaiter(_this, void 0, void 0, function () {
        var user, filter, path;
        return __generator(this, function (_a) {
            user = get_1.default(params, 'user', '');
            filter = get_1.default(params, 'filter', 'latest');
            if (isEmpty_1.default(user)) {
                path = '/collection';
            }
            else {
                path = "/user/" + user + "/collection";
            }
            return [2 /*return*/, api
                    .get(path, {
                    params: {
                        filter: filter,
                    },
                })
                    .then(function (response) { return response.data; })
                    .then(function (rawCollections) { return rawCollections.map(function (collectionRaw) { return new collection_class_1.default({
                    api: api,
                    collectionRaw: collectionRaw,
                }); }); })
                    .catch(function (error) {
                    if (get_1.default(error, 'response.status') === 404) {
                        return null;
                    }
                    throw new Error(error);
                })];
        });
    }); };
    var addCollection = function (params) { return __awaiter(_this, void 0, void 0, function () {
        var user, name, collections;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = params.user, name = params.name;
                    return [4 /*yield*/, getCollections({ user: user })];
                case 1:
                    collections = _a.sent();
                    if (!!isEmpty_1.default(collections)) return [3 /*break*/, 3];
                    if (!collections.some(function (c) { return c.name === name; })) return [3 /*break*/, 3];
                    return [4 /*yield*/, collections.find(function (c) { return c.name === name; })];
                case 2: return [2 /*return*/, _a.sent()];
                case 3: return [4 /*yield*/, createCollection({ user: user, name: name })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, getCollections({ user: user })];
                case 5:
                    collections = _a.sent();
                    if (!!isEmpty_1.default(collections)) return [3 /*break*/, 7];
                    return [4 /*yield*/, collections.find(function (c) { return c.name === name; })];
                case 6: return [2 /*return*/, _a.sent()];
                case 7: return [2 /*return*/, Promise.reject()];
            }
        });
    }); };
    return {
        getCollections: getCollections,
        addCollection: addCollection,
    };
};
exports.default = exports.Store;
