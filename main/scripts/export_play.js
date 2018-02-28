"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Crawlers = require("../index");
const filer = require("filer_sf");
const path = require("path");
const moment = require("moment");
let start = (file = '', days = 30) => __awaiter(this, void 0, void 0, function* () {
    try {
        if (!file) {
            file = `../../logs/play-${moment().format('YYYYMMDD')}.xlsx`;
        }
        file = path.join(__dirname, file);
        let resp = yield Crawlers.export_play(days);
        console.log(resp.date);
        console.log(resp.plays);
        filer.write(file, resp.plays);
    }
    catch (error) {
        console.error(error);
    }
    finally {
        console.log('需要先在当前目录下创建一个 logs 文件夹。');
        process.exit();
    }
});
start();
