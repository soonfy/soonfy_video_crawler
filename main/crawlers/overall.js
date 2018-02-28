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
const _ = require("lodash");
const moment = require("moment");
const iqiyi_1 = require("../parsers/iqiyi");
const qq_1 = require("../parsers/qq");
const letv_1 = require("../parsers/letv");
const sohu_1 = require("../parsers/sohu");
const youku_1 = require("../parsers/youku");
const mgtv_1 = require("../parsers/mgtv");
const pptv_1 = require("../parsers/pptv");
const acfun_1 = require("../parsers/acfun");
const film_1 = require("../models/film");
const film_plist_1 = require("../models/film_plist");
const film_plist_episode_1 = require("../models/film_plist_episode");
const film_plist_episode_playcount_1 = require("../models/film_plist_episode_playcount");
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
const OFFSET = 86400000;
const crawl = (films) => __awaiter(this, void 0, void 0, function* () {
    try {
        if (!Array.isArray(films)) {
            films = [films];
        }
        let promises = films.map((film) => __awaiter(this, void 0, void 0, function* () {
            let data;
            let { site } = film;
            switch (site) {
                case 'iqiyi':
                    data = yield iqiyi_1.crawlIqiyi([film]);
                    break;
                case 'qq':
                    data = yield qq_1.crawlQQ([film]);
                    break;
                case 'letv':
                    data = yield letv_1.crawlLetv([film]);
                    break;
                case 'sohu':
                    data = yield sohu_1.crawlSohu([film]);
                    break;
                case 'youku':
                    data = yield youku_1.crawlYouku([film]);
                    break;
                case 'mgtv':
                    data = yield mgtv_1.crawlMgtv([film]);
                    break;
                case 'pptv':
                    data = yield pptv_1.crawlPptv([film]);
                    break;
                case 'acfun':
                    data = yield acfun_1.crawlAcfun([film]);
                    break;
                default:
                    console.error(`site ${film.site} is error.`);
                    break;
            }
            data = _.assign(film, data);
            return data;
        }));
        let resp = yield Promise.all(promises);
        return resp[0];
    }
    catch (error) {
        console.error(error);
    }
});
exports.crawl = crawl;
const count = (film_ids, start_date, end_date = start_date) => __awaiter(this, void 0, void 0, function* () {
    try {
        if (!Array.isArray(film_ids)) {
            film_ids = [film_ids];
        }
        start_date = new Date(start_date);
        end_date = new Date(end_date);
        let resp = [];
        let index = 0;
        for (let film_id of film_ids) {
            let temp_date = start_date;
            index++;
            while (temp_date <= end_date) {
                console.log(`--> 汇总数据 ${film_id} ${moment(temp_date).format('YYYY-MM-DD')}`);
                let vids = yield film_plist_episode_1.FilmPlistEpisode.find({ film_plist_id: film_id });
                if (vids.length === 0) {
                    continue;
                }
                let _promises = vids.map((vid) => __awaiter(this, void 0, void 0, function* () {
                    return yield film_plist_episode_playcount_1.FilmPlistEpisodePlay.find({ film_plist_episode_id: vid, date: temp_date });
                }));
                let temp = yield Promise.all(_promises);
                if (temp.length === 0) {
                    continue;
                }
                let plays = [];
                temp.map(x => Array.prototype.push.apply(plays, x));
                let value = plays.map(x => x.value).reduce((a, b) => a + b);
                let cal = moment(temp_date).format('YYYY-MM-DD');
                let date = new Date(cal);
                let _id = `${film_ids[index - 1]}:${cal}`;
                let _cplay = {
                    _id,
                    film_plist_id: film_ids[index - 1],
                    date,
                    value,
                    calculated_at: new Date()
                };
                let cplay = yield c_film_plist_playcount_1.CFilmPlistPlayCount.findByIdAndUpdate(_id, { $set: _cplay }, { upsert: true, new: true });
                console.log(`--> 数据汇总成功 ${cplay._id} ${cplay.value}`);
                cplay = null;
                _cplay = null;
                _id = null;
                cal = null;
                value = null;
                temp = null;
                _promises = null;
                vids = null;
                resp.push(cplay);
                temp_date = new Date(temp_date - 0 + OFFSET);
            }
        }
        console.log(`--> 总共汇总 ${resp.length} 条数据.`);
    }
    catch (error) {
        console.error(error);
    }
});
exports.count = count;
const store = (film_play, action = 0) => __awaiter(this, void 0, void 0, function* () {
    try {
        let { film_id, site, uri, vids, plays } = film_play;
        vids = vids.filter(x => x);
        plays = plays.filter(x => typeof x === 'number');
        if (vids.length !== plays.length || plays.length === 0) {
            console.error(`vids length != plays length or plays length == 0`);
            console.error(`vids length ${vids.length}`);
            console.error(`plays length ${plays.length}`);
            return;
        }
        let detail = yield film_plist_1.FilmPlist.findOne({ film_id, site, status: 0 });
        let temp = {
            film_id,
            site,
            uri,
            status: 0,
            crawled_at: new Date(),
            crawled_status: 0
        };
        if (action === 0) {
            temp.updated_at = new Date();
        }
        if (!detail) {
            temp.created_at = new Date();
        }
        detail = yield film_plist_1.FilmPlist.findOneAndUpdate({ film_id, site, status: 0 }, { $set: temp }, {
            upsert: true,
            new: true
        });
        let isCount = {
            status: 0,
            start: null,
            end: null,
        };
        yield film_plist_episode_1.FilmPlistEpisode.remove({ film_plist_id: detail._id });
        let promises = vids.map((vid, index) => __awaiter(this, void 0, void 0, function* () {
            let cal = moment().format('YYYY-MM-DD');
            let date = new Date(cal);
            let _vid = {
                _id: `${detail._id}:${vid}`,
                film_plist_id: detail._id,
            };
            let _play = {
                _id: `${_vid._id}:${cal}`,
                film_plist_episode_id: `${_vid._id}`,
                date,
                value: plays[index],
                created_at: new Date(),
                is_real: 1
            };
            yield film_plist_episode_1.FilmPlistEpisode.create(_vid);
            let play = yield film_plist_episode_playcount_1.FilmPlistEpisodePlay.findOneAndUpdate({ _id: _play._id }, { $set: _play }, { upsert: true, new: true });
            let _plays = yield film_plist_episode_playcount_1.FilmPlistEpisodePlay.find({
                film_plist_episode_id: play.film_plist_episode_id,
                is_real: 1
            }).sort({
                date: -1
            }).limit(2);
            if (_plays.length >= 2) {
                let start = _plays[1].date;
                let end = _plays[0].date;
                if (end - start > OFFSET) {
                    if (isCount.status === 0) {
                        isCount.status = 1;
                        isCount.start = start - 0 + OFFSET;
                        isCount.end = end - OFFSET;
                    }
                    else {
                        if (isCount.start > start) {
                            isCount.start = start - 0 + OFFSET;
                        }
                        else if (isCount.end < end) {
                            isCount.end = end - OFFSET;
                        }
                    }
                    console.log(`--> 需要拟合，汇总数据 ${_plays[1]._id} ${_plays[0]._id}`);
                    yield fit(_plays);
                }
            }
            return play;
        }));
        let data = yield Promise.all(promises);
        if (isCount.status === 1) {
            yield count(detail._id, isCount.start, isCount.end);
        }
        let cal = moment().format('YYYY-MM-DD');
        let date = new Date(cal);
        let value = plays.reduce((a, b) => a + b, 0);
        let _cplay = {
            _id: `${detail._id}:${cal}`,
            film_plist_id: `${detail._id}`,
            date,
            value,
            calculated_at: new Date()
        };
        let cplay = yield c_film_plist_playcount_1.CFilmPlistPlayCount.findOneAndUpdate({ _id: _cplay._id }, { $set: _cplay }, { upsert: true, new: true });
        console.log(`--> 视频播放量存储成功 ${detail._id} ${cal} ${value}`);
        film_play.cplay = cplay.value;
        return film_play;
    }
    catch (error) {
        console.error(error);
    }
});
exports.store = store;
const fit = (plays) => __awaiter(this, void 0, void 0, function* () {
    try {
        let film_plist_episode_id = plays[0].film_plist_episode_id, start = plays[1].date, end = plays[0].date, count = Math.floor((end - start) / OFFSET), diff = plays[0].value - plays[1].value, inc = Math.floor(diff / count), index = 1;
        console.log(`--> ${film_plist_episode_id} 缺失 ${count - 1} 天数据.`);
        while (index < count) {
            let cal = moment(end - OFFSET * index).format('YYYY-MM-DD');
            let date = new Date(cal);
            let value = plays[0].value - inc * index;
            let _play = {
                _id: `${film_plist_episode_id}:${cal}`,
                film_plist_episode_id,
                date,
                value,
                created_at: new Date(),
                is_real: 0
            };
            let resp = yield film_plist_episode_playcount_1.FilmPlistEpisodePlay.findByIdAndUpdate(_play._id, {
                $set: _play
            }, {
                upsert: true,
                new: true
            });
            console.log(`--> 第 ${index} 次拟合成功`, resp._id, resp.value);
            index++;
        }
        console.log(`--> 数据全部拟合成功 ${plays[1]._id} ${plays[0]._id}`);
    }
    catch (error) {
        console.error(error);
    }
});
exports.fit = fit;
const main = (film, action = 0) => __awaiter(this, void 0, void 0, function* () {
    try {
        let resp = yield crawl([film]);
        if (!resp) {
            return film;
        }
        let { vids, plays } = resp;
        if (!resp.vids || !resp.plays) {
            console.log(resp);
            return film;
        }
        vids = vids.filter(x => x);
        plays = plays.filter(x => typeof x === 'number');
        if (vids.length === plays.length && plays.length > 0) {
            let cfilm = yield store(resp, action);
            return cfilm;
        }
        else {
            console.error(`--> vids length != plays length or plays length == 0`);
            return film;
        }
    }
    catch (error) {
        console.error(error);
        return film;
    }
});
exports.main = main;
const search = (days = 30) => __awaiter(this, void 0, void 0, function* () {
    try {
        let plays = [], date = moment().format('YYYY-MM-DD'), temp = moment().format('YYYY-MM-DD'), start = moment().startOf('day');
        let index = 0;
        let films = yield film_plist_1.FilmPlist.count({ crawled_status: { $gte: 0 }, crawled_at: { $gte: new Date('2017-06-20') } });
        let vids = yield film_plist_episode_1.FilmPlistEpisode.count({});
        while (index < days) {
            ++index;
            temp = new Date(temp);
            let cal = moment(temp).format('YYYY-MM-DD');
            let eplays = yield film_plist_episode_playcount_1.FilmPlistEpisodePlay.count({ date: temp });
            let cplays = yield c_film_plist_playcount_1.CFilmPlistPlayCount.count({ date: temp });
            plays.push([cal, cplays, eplays]);
            temp = temp.valueOf() - OFFSET;
        }
        return {
            date,
            films,
            vids,
            plays
        };
    }
    catch (error) {
        console.error(error);
    }
});
exports.search = search;
const export_play = (days = 30) => __awaiter(this, void 0, void 0, function* () {
    try {
        let plays = [], date = moment().format('YYYY-MM-DD');
        plays.push(['日期', '剧目film plist id', '播放量']);
        let film_ids = yield film_plist_1.FilmPlist.find();
        console.log(film_ids.length);
        let promises = film_ids.map((film) => __awaiter(this, void 0, void 0, function* () {
            let error_status = 0;
            let _plays = yield c_film_plist_playcount_1.CFilmPlistPlayCount.find({ film_plist_id: film._id }).sort({ date: 1 });
            if (_plays.length > 1) {
                _plays.map((_play, index) => {
                    if (index > 0 && (_play.value - _plays[index - 1].value < 0)) {
                        error_status = 1;
                    }
                });
            }
            if (error_status === 1) {
                _plays.map(_play => plays.push([moment(_play.date).format('YYYY-MM-DD'), _play.film_plist_id, _play.value]));
            }
        }));
        yield Promise.all(promises);
        return {
            date,
            plays
        };
    }
    catch (error) {
        console.error(error);
        return yield export_play(days);
    }
});
exports.export_play = export_play;
const export_film = (date) => __awaiter(this, void 0, void 0, function* () {
    try {
        date = moment(date).format('YYYY-MM-DD');
        let films = [], start = moment(date).startOf('day');
        ;
        films.push(['最近更新日期', '剧目 id', '剧目名称', '网站', '剧目 film plist id', '链接状态(0正常, 1可能异常)', '链接']);
        let film_ids = yield film_plist_1.FilmPlist.find({ crawled_at: { $lt: start }, status: { $gte: 0 } });
        console.log(film_ids.length);
        for (let _film of film_ids) {
            let fn = yield film_1.Film.findOne({ _id: _film.film_id, status: { $gte: 0 }, isDeleted: { $ne: true } });
            fn ? films.push([moment(_film.crawled_at).format('YYYY-MM-DD'), fn._id, fn.name, _film.site, _film._id, _film.crawled_status, _film.uri]) : '';
        }
        film_ids = yield film_plist_1.FilmPlist.find({ crawled_status: 1 });
        console.log(film_ids.length);
        for (let _film of film_ids) {
            let fn = yield film_1.Film.findOne({ _id: _film.film_id, status: { $gte: 0 }, isDeleted: { $ne: true } });
            fn ? films.push([moment(_film.crawled_at).format('YYYY-MM-DD'), fn._id, fn.name, _film.site, _film._id, _film.crawled_status, _film.uri]) : '';
        }
        return {
            date,
            films
        };
    }
    catch (error) {
        console.error(error);
        return yield export_film(date);
    }
});
exports.export_film = export_film;
const search_video = () => __awaiter(this, void 0, void 0, function* () {
    try {
        let params = {
            type: '综艺',
            year: 2017
        };
        let data = yield pptv_1.searchPptv(params);
        console.log(data);
    }
    catch (error) {
        console.error(error);
    }
});
