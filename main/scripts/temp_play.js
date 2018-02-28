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
const path = require("path");
const mongoose = require("mongoose");
const filer = require("filer_sf");
const film_1 = require("../models/film");
const film_plist_1 = require("../models/film_plist");
const c_film_plist_playcount_1 = require("../models/c_film_plist_playcount");
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
console.log(Config);
mongoose.connect(Config && Config.db && Config.db.uris);
const format_date = (offset = 0, type = 'date') => {
    let stamp = Date.now();
    stamp = stamp - offset * 1000 * 60 * 60 * 24;
    let date = new Date(stamp);
    let year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate();
    month < 10 ? month = '0' + month : '';
    day < 10 ? day = '0' + day : '';
    if (type === 'date') {
        return new Date(`${year}-${month}-${day}`);
    }
    else {
        return `${year}-${month}-${day}`;
    }
};
const start = () => __awaiter(this, void 0, void 0, function* () {
    try {
        let data = [['剧目名称', '日期', '网站', '播放增量']];
        let films = yield film_1.Film.find({ created_at: { $gte: new Date('2017-07-28') } });
        console.log(films.length);
        for (let film of films) {
            let name = film.name;
            console.log(name);
            let fplist = yield film_plist_1.FilmPlist.find({ film_id: film._id });
            for (let fp of fplist) {
                let site = fp.site;
                let last = yield c_film_plist_playcount_1.CFilmPlistPlayCount.findOne({ film_plist_id: fp._id, date: format_date(1) });
                last = last ? last.value : 0;
                console.log(last);
                let lastl = yield c_film_plist_playcount_1.CFilmPlistPlayCount.findOne({ film_plist_id: fp._id, date: format_date(2) });
                lastl = lastl ? lastl.value : 0;
                console.log(lastl);
                let add = last - lastl;
                data.push([name, format_date(1, 'string'), site, add]);
            }
        }
        let file = path.join(__dirname, `../../logs/plays-${format_date(0, 'string')}.xlsx`);
        filer.write(file, data);
        process.exit();
    }
    catch (error) {
        console.error(error);
    }
});
start();
