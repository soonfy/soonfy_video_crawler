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
const film_1 = require("../models/film");
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
console.log(Config);
mongoose.connect(Config && Config.db && Config.db.uris);
const sites = ['iqiyi', 'qq', 'letv', 'sohu', 'youku', 'mgtv', 'pptv'];
const csites = ['爱奇艺', '腾讯', '乐视', '搜狐', '优酷', '芒果', 'PPTV'];
const cates = ['体育', '电影', '电视剧', '综艺', '网络剧', '网络综艺', '民生新闻', '动画电影', '动画剧集', '纪录片', '自媒体', '网络大电影', '民生节目', '大型综艺晚会', '广告短片', '其它-电视台', '其它-网络节目', '其它-其它'];
const info = (film_id) => __awaiter(this, void 0, void 0, function* () {
    try {
        let film = yield film_1.Film.findById(film_id);
        if (!film) {
            console.error(`*****************`);
            console.error(`film id ${film_id} error.`);
            console.error(`*****************`);
            process.exit();
        }
        else {
            let cate = cates[film.category];
            let name = film.name;
            let filmid = film._id;
            let keyword = film.keywords.map(x => x.join('+')).join('||') || null;
            let baidu_index = film.baidu_index_keyword || null;
            let year = film.year || null;
            let start = film.release_date ? moment(film.release_date).format('YYYY-MM-DD') : null;
            let end = film.ending_date ? moment(film.ending_date).format('YYYY-MM-DD') : null;
            let episode = film.episode || null;
            let db_uri = film.douban_id ? `https://movie.douban.com/subject/${film.douban_id}/` : null;
            let db_type = film.douban_types && film.douban_types.length > 0 ? film.douban_types.join('||') : null;
            let db_score = film.rank || null;
            let db_score_num = film.rank_count || null;
            let star = yield film.getStarInfo();
            let directors = star.directors.join('||') || null;
            let actors = star.actors.join('||') || null;
            let screenwriters = star.screenwriters.join('||') || null;
            let languages = film.languages && film.languages.length > 0 ? film.languages.join('||') : null;
            let production_countrys = film.production_countrys && film.production_countrys.length > 0 ? film.production_countrys.join('||') : null;
            let mtime_uri = film.mtime_id ? `http://movie.mtime.com/${film.mtime_id}/` : null;
            let mtime_data = yield film.getCompany();
            let rel_c = mtime_data.release_company.join('||') || null;
            let make_c = mtime_data.make_company.join('||') || null;
            let sites = (yield film.getSites()).map(x => x.csite).join('||') || null;
            let tvs = (yield film.getTvs()).map(x => x.csite).join('||') || null;
            let store = film.created_at ? moment(film.created_at).format('YYYY-MM-DD') : null;
            return [cate, name, filmid, year, start, end, keyword, baidu_index, episode,
                db_uri, db_type, db_score, db_score_num,
                directors, actors, screenwriters, languages, production_countrys, mtime_uri, rel_c, make_c,
                sites, tvs, store];
        }
    }
    catch (error) {
        console.error(error);
        process.exit();
    }
});
exports.default = info;
