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
const moment = require("moment");
const Crawlers = require("../index");
const film_plist_1 = require("../models/film_plist");
const film_1 = require("../models/film");
let Config;
try {
    Config = require('../../config.json');
}
catch (error) {
    try {
        Config = require('../config.json');
    }
    catch (error) {
        console.error(`配置文件 config.json 路径没找到`);
        process.exit();
    }
}
const sleep = (ss) => __awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve) => {
        console.log('sleep -->', ss);
        setTimeout(resolve, ss * 1000);
    });
});
const main = () => __awaiter(this, void 0, void 0, function* () {
    try {
        let delay = 1000 * 60 * 30;
        let film = yield film_plist_1.FilmPlist.findOneAndUpdate({ crawled_status: 1, crawled_at: { $lt: Date.now() - delay } }, { $set: { crawled_at: new Date() } }, { sort: { crawled_at: 1 }, new: true });
        if (!film) {
            film = yield film_plist_1.FilmPlist.findOneAndUpdate({ crawled_status: 0 }, { $set: { crawled_status: 1, crawled_at: new Date() } }, { sort: { crawled_at: 1 }, new: true });
        }
        let detail = yield film_1.Film.findById(film.film_id);
        if (!detail) {
            console.error(film);
            console.error(`films no find name.`);
            yield film_plist_1.FilmPlist.findOneAndUpdate({ _id: film._id }, { $set: { crawled_status: -2 } });
        }
        else {
            film = film.toObject();
            film.show_type = detail.show_type;
            film.year = detail.year;
            console.log(film);
            let cfilm = yield Crawlers.main(film, 1);
            if (cfilm && cfilm.cplay) {
                console.log(`采集成功。`);
                yield film_plist_1.FilmPlist.findOneAndUpdate({ _id: film._id }, { $set: { crawled_status: 0, crawled_at: new Date() } });
            }
            else {
                console.error(`采集失败。`);
            }
            cfilm = null;
        }
        film = null;
        detail = null;
        delay = null;
    }
    catch (error) {
        console.error(error);
    }
});
const start = () => __awaiter(this, void 0, void 0, function* () {
    try {
        while (true) {
            yield main();
            console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
            console.log(`----------------->`);
            console.log(`开始下一次采集。`);
        }
    }
    catch (error) {
        console.error(error);
    }
});
start();
