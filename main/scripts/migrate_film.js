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
const film_detail_1 = require("../models/film_detail");
const start = () => __awaiter(this, void 0, void 0, function* () {
    try {
        console.log(`start migrate film details.`);
        let films = yield film_detail_1.FilmDetail.find({ status: { $gte: 0 }, isDeleted: { $ne: true } });
        console.log(films.length);
        let index = 0;
        for (let film of films) {
            console.log(++index);
            console.log(film);
            let { filmId: film_id, name, site, showType: show_type, year } = film, uri = '';
            console.log(film_id, name, site, show_type, year);
            switch (site) {
                case 'iqiyi':
                    uri = film.iqiyiInfos && film.iqiyiInfos.iqiyiuri;
                    break;
                case 'qq':
                    uri = film.qqInfos && film.qqInfos.qquri;
                    break;
                case 'letv':
                    uri = film.leInfos && film.leInfos.leuri;
                    break;
                case 'sohu':
                    uri = film.sohuInfos && film.sohuInfos.sohuuri;
                    break;
                case 'youku':
                    uri = film.youkuInfos && film.youkuInfos.youkuuri;
                    break;
                case 'mgtv':
                    uri = film.mgtvInfos && film.mgtvInfos.mgtvuri;
                    break;
                case 'pptv':
                    uri = film.pptvInfos && film.pptvInfos.pptvuri;
                    break;
                default:
                    console.error('no find site.', site);
                    uri = 'site error';
                    break;
            }
            console.log(uri);
            if (!uri || uri === 'site error') {
                continue;
            }
            else {
                let _film = yield film_plist_1.FilmPlist.findOneAndUpdate({ film_id, site }, { $set: { crawled_status: 0 } });
                console.log(_film);
            }
        }
        console.log(`all films migrate over.`);
        process.exit();
    }
    catch (error) {
        console.error(error);
    }
});
start();
