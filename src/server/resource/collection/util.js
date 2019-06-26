"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var get_1 = __importDefault(require("lodash/get"));
var isEmpty_1 = __importDefault(require("lodash/isEmpty"));
var slugify_1 = __importDefault(require("slugify"));
exports.getCollectionRangeKey = function (user, uuid, createVersion) {
    if (uuid === void 0) { uuid = ''; }
    if (createVersion === void 0) { createVersion = false; }
    var name = slugify_1.default(user) + "#";
    if (!isEmpty_1.default(uuid)) {
        name += slugify_1.default(uuid) + "#";
        if (createVersion) {
            name += "" + Date.now().toString();
        }
    }
    return name;
};
exports.prettifyCollection = function (raw) {
    var userCollectionVersion = get_1.default(raw, 'userCollectionVersion.S');
    var versionStartIndex = userCollectionVersion.lastIndexOf('#');
    var collectionStartIndex = userCollectionVersion.lastIndexOf('#', (versionStartIndex - 1));
    var application = get_1.default(raw, 'application.S');
    var user = userCollectionVersion.slice(0, collectionStartIndex);
    var collection = userCollectionVersion.slice((collectionStartIndex + 1), versionStartIndex);
    var version = parseInt(userCollectionVersion.slice((versionStartIndex + 1)), 10);
    var deletedAt = get_1.default(raw, 'deletedAt.S');
    var name = get_1.default(raw, 'name.S');
    return {
        meta: {
            application: application,
            user: user,
            collection: collection,
            version: version,
            deletedAt: deletedAt,
        },
        name: name,
    };
};
