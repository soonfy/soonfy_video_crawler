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
const filer = require("filer_sf");
const mongoose = require("mongoose");
const film_1 = require("../models/film");
const film_plist_1 = require("../models/film_plist");
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
const sites = ['iqiyi', 'qq', 'letv', 'sohu', 'youku', 'mgtv'];
const csites = ['爱奇艺', '腾讯', '乐视', '搜狐', '优酷', '芒果'];
const cates = ['体育', '电影', '电视剧', '综艺', '网络剧', '网络综艺', '民生新闻', '动画电影', '动画剧集', '纪录片', '自媒体', '网络大电影', '民生节目', '大型综艺晚会', '广告短片', '其它-电视台', '其它-网络节目', '其它-其它'];
const ensure_cate = (num) => {
    let cate = typeof num === 'number' ? cates[num] : cates.indexOf(num);
    return cate;
};
const start = () => __awaiter(this, void 0, void 0, function* () {
    try {
        let films = yield film_1.Film.find({ status: 1, is_deleted: { $ne: true } });
        let data = [['类型', '名称', '爱奇艺标签', '腾讯标签', '乐视标签', '搜狐标签', '优酷标签', '芒果标签']];
        console.log(films.length);
        let index = 0;
        for (let film of films) {
            console.log(++index);
            let name = film.name, cate = ensure_cate(film.category) || '没有剧目类型数据';
            let promises = sites.map((site) => __awaiter(this, void 0, void 0, function* () {
                let fp = yield film_plist_1.FilmPlist.findOne({ film_id: film._id, site, status: 0 });
                let label = fp ? fp.label : '没有找到链接';
                label = label || '没有找到标签';
                return label;
            }));
            let labels = yield Promise.all(promises);
            console.log(labels);
            let line = [cate, name];
            line = line.concat(labels);
            data.push(line);
        }
        let file = path.join(__dirname, `../../output/film-labels.xlsx`);
        filer.write(file, data);
        console.log(`=================`);
        console.log(`file output ${file}`);
        console.log(`=================`);
        process.exit();
    }
    catch (error) {
        console.error(error);
    }
});
start();
