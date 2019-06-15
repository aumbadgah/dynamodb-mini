"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var isEmpty_1 = __importDefault(require("lodash/isEmpty"));
var filters = [
    {
        name: 'all',
    },
    {
        name: 'latest',
        default: true,
    },
    {
        name: 'current',
    },
];
var normalizeFilter = function (req, res, next) {
    var defaultFilter = filters.find(function (filterConf) { return filterConf.default || false; });
    if (!defaultFilter) {
        throw new Error('Invalid collection query.filter configuration');
    }
    var isRequestedFilterValid = filters.some(function (filter) { return filter.name === req.query.filter; });
    if (isEmpty_1.default(req.query.filter) || !isRequestedFilterValid) {
        req.query.filter = defaultFilter.name;
    }
    next();
};
exports.default = normalizeFilter;
