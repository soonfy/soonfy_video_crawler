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
const mongoose = require("mongoose");
const fs = require("fs");
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
mongoose.connect(Config && Config.db && Config.db.uris);
const film_plist_1 = require("../models/film_plist");
const film_plist_episode_1 = require("../models/film_plist_episode");
const find_id = () => __awaiter(this, void 0, void 0, function* () {
    try {
        console.log(`start find film ids.`);
        let pe_films = yield film_plist_episode_1.FilmPlistEpisode.distinct('film_plist_id');
        console.log(pe_films.length);
        console.log(pe_films[0]);
        let index = 0;
        for (let id of pe_films) {
            console.log(++index);
            let film = yield film_plist_1.FilmPlist.findById(id);
            if (!film) {
                console.log(id);
                fs.appendFileSync('./ids.txt', id + '\n');
            }
        }
        console.log(`find films ids over.`);
        process.exit();
    }
    catch (error) {
        console.error(error);
    }
});
const drop_episode = () => __awaiter(this, void 0, void 0, function* () {
    try {
        console.log(`start drop film episodes.`);
        let ids = fs.readFileSync('./ids.txt', 'utf-8').split('\n');
        console.log(ids);
        for (let id of ids) {
            console.log(id);
            let fpes = yield film_plist_episode_1.FilmPlistEpisode.remove({ film_plist_id: id });
            console.log('ok', fpes.result.ok);
            console.log('n', fpes.result.n);
        }
        console.log(`drop film episodes over.`);
        process.exit();
    }
    catch (error) {
        console.error(error);
    }
});
drop_episode();
