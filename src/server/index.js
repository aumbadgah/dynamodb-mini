"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = __importDefault(require("./config"));
var server_1 = __importDefault(require("./server"));
var db_1 = __importDefault(require("./db"));
db_1.default.init().then(function () {
    server_1.default.listen(config_1.default.PORT, function () {
        console.log("Store API listening in port " + config_1.default.PORT);
    });
});
