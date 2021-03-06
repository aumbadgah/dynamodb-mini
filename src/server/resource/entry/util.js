"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var get_1 = __importDefault(require("lodash/get"));
var isEmpty_1 = __importDefault(require("lodash/isEmpty"));
var slugify_1 = __importDefault(require("slugify"));
exports.prettifyEntry = function (raw) {
    var userCollection = raw.userCollection.S;
    var entryVersion = raw.entryVersion.S;
    var collectionStartIndex = userCollection.lastIndexOf('#', (userCollection.length - 2));
    var versionStartIndex = entryVersion.lastIndexOf('#');
    var user = userCollection.slice(0, collectionStartIndex);
    var collection = userCollection.slice((collectionStartIndex + 1), (userCollection.length - 1));
    var entry = entryVersion.slice(0, versionStartIndex);
    var version = parseInt(entryVersion.slice((versionStartIndex + 1)), 10);
    var deletedAt = get_1.default(raw, 'deletedAt.S');
    var name = get_1.default(raw, 'name.S');
    var valueRaw = get_1.default(raw, 'value.S');
    return {
        meta: {
            user: user,
            collection: collection,
            entry: entry,
            version: version,
            deletedAt: deletedAt,
        },
        name: name,
        value: valueRaw
            ? JSON.parse(valueRaw)
            : undefined,
    };
};
exports.getEntryRangeKey = function (uuid, createVersion) {
    if (uuid === void 0) { uuid = ''; }
    if (createVersion === void 0) { createVersion = false; }
    var name = slugify_1.default(uuid) + "#";
    if (createVersion) {
        name += "" + Date.now().toString();
    }
    return name;
};
exports.validateEntryInput = function (req, res, next) {
    var _a = req.body, name = _a.name, value = _a.value;
    try {
        if (isEmpty_1.default(name) && isEmpty_1.default(value)) {
            throw new Error('Entry name or value required');
        }
        if (!isEmpty_1.default(value) && !(typeof value === 'object' || (value && value.constructor === Object))) {
            throw new Error('Invalid entry payload');
        }
        next();
    }
    catch (error) {
        next({
            status: 400,
            message: error.toString(),
        });
    }
};
