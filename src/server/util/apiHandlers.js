"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = __importDefault(require("../config"));
var access = function (req, res, next) {
    console.log("REQUEST ::: " + req.method + " " + req.originalUrl);
    if (config_1.default.DEBUG) {
        console.log('REQUEST ::: req.headers');
        console.log(JSON.stringify(req.headers, null, 2));
        console.log('REQUEST ::: req.body');
        console.log(JSON.stringify(req.body, null, 2));
    }
    next();
};
var authorization = function (req, res, next) {
    var receivedKey = req.headers['x-api-key'];
    var account = config_1.default.API_KEYS.find(function (apiKey) { return apiKey.key === receivedKey; });
    if (!receivedKey || !account) {
        next({
            status: 401,
        });
        return;
    }
    req.user = {
        name: account.application,
    };
    if (config_1.default.DEBUG) {
        console.log('AUTHORIZATION ::: req.user');
        console.log(JSON.stringify(req.user, null, 2));
    }
    next();
};
var error = function (err, req, res, next) {
    var status = err.status || 500;
    console.log("ERROR ::: " + req.method + " " + req.originalUrl);
    console.log(JSON.stringify(err, null, 2));
    res.status(status).send(err.message);
};
var response = function (req, res) {
    var returnData = res.locals.returnData;
    console.log("SUCCESS ::: " + req.method + " " + req.originalUrl);
    if (returnData) {
        if (config_1.default.DEBUG) {
            console.log('SUCCESS ::: response returnData');
            console.log(JSON.stringify(returnData, null, 2));
        }
        res.json(returnData);
        return;
    }
    res.send();
};
var apiHandlers = {
    access: access,
    authorization: authorization,
    error: error,
    response: response,
};
exports.default = apiHandlers;
