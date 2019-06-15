"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var groupBy_1 = __importDefault(require("lodash/groupBy"));
var last_1 = __importDefault(require("lodash/last"));
var groupByKeyWithoutVersion = function (keyName, items) { return groupBy_1.default(items, function (item) {
    // @ts-ignore
    if (!item || !item[keyName] || !item[keyName].S || !item[keyName].S.includes('#')) {
        throw new Error("Invalid AttributeMap[" + keyName + "].S");
    }
    // @ts-ignore
    var versionStartIndex = item[keyName].S.lastIndexOf('#');
    // @ts-ignore
    return item[keyName].S.slice(0, versionStartIndex);
}); };
var filterItems = function (keyName, filter, items) {
    var groupedItems = groupByKeyWithoutVersion(keyName, items);
    if (filter === 'latest') {
        return Object.values(groupedItems)
            .map(function (version) { return last_1.default(version); })
            .filter(function (latest) { return latest && !latest.deletedAt; });
    }
    if (filter === 'current') {
        return Object.values(groupedItems)
            .map(function (version) { return last_1.default(version); });
    }
    return items;
};
exports.default = filterItems;
