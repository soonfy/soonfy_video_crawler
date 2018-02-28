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
const moment = require("moment");
const rp = require("request-promise");
const cheerio = require("cheerio");
const path = require("path");
const filer = require("filer_sf");
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
const film_1 = require("../models/film");
const film_plist_1 = require("../models/film_plist");
const search_iqiyi = (name) => __awaiter(this, void 0, void 0, function* () {
    try {
        console.log(`start search iqiyi.`);
        console.log(name);
        let temp = 0;
        let sr = '';
        while (temp < 12) {
            sr += Math.floor(Math.random() * 8 + 1);
            ++temp;
        }
        let option = {
            method: 'get',
            uri: `http://so.iqiyi.com/so/q_${encodeURI(name)}?source=input&sr=${sr}`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
                'Host': 'so.iqiyi.com',
                'Referer': 'http://www.iqiyi.com/',
            }
        };
        let body = yield rp(option);
        let $ = cheerio.load(body);
        let div = $('.bottom_right').first();
        let site_name = $(div).parents('.result_info').find('a').first().text().trim();
        let ems = $(div).find('.vm-inline');
        let pre = 'http://so.iqiyi.com/multiEpisode?key=pptv%3A04d18177f39c33d06de54ee447f94f73&platform=web&site=pptv';
        let sites = ems.map((i, x) => {
            let key = $(x).attr('data-doc-id');
            let platform = $(x).attr('data-platform');
            let site = $(x).attr('data-site');
            return { key, platform, site, site_name };
        });
        sites = sites.toArray();
        let uris = yield Promise.all(sites.map((x) => __awaiter(this, void 0, void 0, function* () {
            let option = {
                method: 'get',
                uri: `http://so.iqiyi.com/multiEpisode?key=${encodeURI(x.key)}&platform=${x.platform}&site=${x.site}`,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
                    'Host': 'so.iqiyi.com',
                    'Referer': 'http://www.iqiyi.com/',
                }
            };
            let body = yield rp(option);
            body = body.match(/try\{\(([\w\W]*)\)\;\}catch\(e\)\{\}\;/)[1];
            let data = JSON.parse(body).data;
            let $ = cheerio.load(data);
            let uri = $('.album_link').first().attr('href');
            return { name: name, site: x.site, uri: uri, site_name: x.site_name };
        })));
        return uris;
    }
    catch (error) {
        console.error(error);
        process.exit();
    }
});
const main = () => __awaiter(this, void 0, void 0, function* () {
    try {
        let uri_file = `../../logs/视频链接刷新结果-${moment().format('YYYYMMDD')}.xlsx`;
        let films = yield film_1.Film.find({
            status: 1,
            is_deleted: false,
            show_type: {
                $ne: 1
            },
        });
        console.log(films.length);
        let head = [['剧目id', 'ivst剧目名称', '网站类型', '网站剧目名称', 'ivst是否存在', '链接']];
        let index = 0;
        for (let film of films) {
            console.log(++index);
            let uris = yield search_iqiyi(film['name']);
            let data = yield Promise.all(uris.map((x) => __awaiter(this, void 0, void 0, function* () {
                let temp = [];
                if (x['site'] === 'imgo') {
                    x['site'] = 'mgtv';
                }
                if (yield film_plist_1.FilmPlist.findOne({ film_id: film._id, site: x['site'] })) {
                    temp = [film['_id'], film['name'], x['site'], x['site_name'], '已存在', x['uri']];
                }
                else {
                    temp = [film['_id'], film['name'], x['site'], x['site_name'], '缺少链接', x['uri']];
                }
                console.log(temp);
                head.push(temp);
            })));
        }
        console.log('all films search over.');
        console.log(head.length);
        uri_file = path.join(__dirname, uri_file);
        filer.write(uri_file, head);
        process.exit();
    }
    catch (error) {
        console.error(error);
        process.exit();
    }
});
main();
