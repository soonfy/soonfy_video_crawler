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
const moment = require("moment");
const mongoose = require("mongoose");
const filer = require("filer_sf");
const film_1 = require("../models/film");
const tv_1 = require("../models/tv");
const actor_1 = require("../models/actor");
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
const cates = ['体育', '电影', '电视剧', '综艺', '网络剧', '网络综艺', '民生新闻', '动画电影', '动画剧集', '纪录片', '自媒体', '网络大电影', '民生节目', '大型综艺晚会', '广告短片', '其它-电视台', '其它-网络节目', '其它-其它'];
const ensure_cate = (num) => {
    let cate = typeof num === 'number' ? cates[num] : cates.indexOf(num);
    return cate;
};
const start = () => __awaiter(this, void 0, void 0, function* () {
    try {
        console.log(`==============`);
        console.log(`输入剧目类型 id 导出对应类型最近3个月添加剧目的关键词，不输入则导出所有类型最近3个月添加剧目的关键词`);
        let argv = process.argv[2];
        console.log(`==============`);
        if (argv) {
            argv = argv.trim() - 0;
            console.log(`需要导出 ${cates[argv]} 类别的关键词`);
        }
        else {
            argv = -1;
            console.log(`需要导出 所有 类别的关键词`);
        }
        console.log(`==============`);
        let data = [['剧目类型', '剧目名称', '剧目id', '微博，微信，百度新闻关键词', '百度指数关键词', '上映年份', '开播日期', '收官日期', '电视台', '添加日期', '演员']];
        let films = [];
        if (argv === -1) {
            films = yield film_1.Film.find({ status: 1, is_deleted: { $ne: true }, created_at: { $gte: moment().subtract(3, 'months') } });
        }
        else {
            films = yield film_1.Film.find({ category: argv, status: 1, is_deleted: { $ne: true }, created_at: { $gte: moment().subtract(3, 'months') } });
        }
        for (let film of films) {
            let cate = cates[film.category] || '没有剧目类型';
            let keywords = film.keywords;
            let baidu_index_keyword = film.baidu_index_keyword || '没有百度指数关键词';
            keywords = !keywords || keywords.length === 0 ? ['没有微博关键词'] : keywords.map(x => x.join('+'));
            let year = film.year || '没有上映年份数据', tvs = film.tvs, actor_ids = film.actor_ids, release_date = film.release_date ? moment(film.release_date).format('YYYY-MM-DD') : '没有开播日期', ending_date = film.ending_date ? moment(film.ending_date).format('YYYY-MM-DD') : '没有收官日期', created_date = film.created_at ? moment(film.created_at).format('YYYY-MM-DD') : '没有添加日期';
            if (tvs && tvs.length > 0) {
                tvs = yield Promise.all(tvs.map((x) => __awaiter(this, void 0, void 0, function* () { return (yield tv_1.default.findOne({ _id: x })).name; })));
            }
            else {
                tvs = ['没有电视台数据'];
            }
            if (actor_ids && actor_ids.length > 0) {
                actor_ids = yield Promise.all(actor_ids.map((x) => __awaiter(this, void 0, void 0, function* () { return (yield actor_1.default.findOne({ douban_id: x })) ? (yield actor_1.default.findOne({ douban_id: x })).cname : ''; })));
            }
            else {
                tvs = ['没有演员数据'];
            }
            let temp = [cate, film.name.trim(), film._id, keywords.join(' ; '), baidu_index_keyword, year, release_date, ending_date, tvs.join(' ; '), created_date, actor_ids.join(' ; ')];
            data.push(temp);
        }
        let file = path.join(__dirname, `../../output/${cates[argv] || '所有'}-category-keywords.xlsx`);
        filer.write(file, data);
        console.log(`=================`);
        console.log(`file output ${file}`);
        console.log(`=================`);
        process.exit();
    }
    catch (error) {
        console.error(error);
        process.exit();
    }
});
start();
