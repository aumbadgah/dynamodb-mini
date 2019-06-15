"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
    var userCollectionVersion = raw.userCollectionVersion.S;
    var versionStartIndex = userCollectionVersion.lastIndexOf('#');
    var collectionStartIndex = userCollectionVersion.lastIndexOf('#', (versionStartIndex - 1));
    return {
        meta: {
            application: raw.application.S,
            user: userCollectionVersion.slice(0, collectionStartIndex),
            collection: userCollectionVersion.slice((collectionStartIndex + 1), versionStartIndex),
            version: parseInt(userCollectionVersion.slice((versionStartIndex + 1)), 10),
            deletedAt: raw.deletedAt
                ? raw.deletedAt.S
                : undefined,
        },
        name: raw.name.S,
    };
};
