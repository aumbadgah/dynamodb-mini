"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var body_parser_1 = __importDefault(require("body-parser"));
var cors_1 = __importDefault(require("cors"));
var express_1 = __importDefault(require("express"));
var router_1 = __importDefault(require("./resource/collection/router"));
var apiHandlers_1 = __importDefault(require("./util/apiHandlers"));
var app = express_1.default();
app
    .use(body_parser_1.default.json())
    .use(apiHandlers_1.default.access)
    .use(cors_1.default())
    .use(apiHandlers_1.default.authorization)
    .use(function (req, res, next) {
    if (!req.user || !req.user.name) {
    }
    res.locals.application = req.user.name;
    next();
})
    .use('/api', router_1.default)
    .use(apiHandlers_1.default.response)
    .use(apiHandlers_1.default.error);
exports.default = app;
