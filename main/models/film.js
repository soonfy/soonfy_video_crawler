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
const Schema = mongoose.Schema;
const film_plist_1 = require("./film_plist");
const tv_1 = require("../models/tv");
const mtime_1 = require("./mtime");
const star_1 = require("./star");
const datamap = {
    iqiyi: '爱奇艺',
    letv: '乐视视频',
    mgtv: '芒果TV',
    qq: '腾讯视频',
    sohu: '搜狐视频',
    tudou: '土豆网',
    youku: '优酷',
    pptv: 'pptv',
    '爱奇艺': 'iqiyi',
    '乐视视频': 'letv',
    '芒果TV': 'mgtv',
    '腾讯视频': 'qq',
    '搜狐视频': 'sohu',
    '土豆网': 'tudou',
    '优酷': 'youku',
};
const FilmSchema = new Schema({
    name: {
        type: String,
    },
    category: Number,
    year: {
        type: Number,
    },
    show_type: {
        type: Number,
    },
    created_at: {
        type: Date,
    },
    is_deleted: Boolean,
    status: Number,
    keywords: Array,
    baidu_index_keyword: String,
    release_date: Date,
    ending_date: Date,
    tvs: Array,
    episode: Number,
    from_id: String,
    douban_types: Array,
    director_ids: Array,
    actor_ids: Array,
    rank: Number,
    rank_count: Number,
    douban_id: String,
    first_play: String,
    make_category: {
        type: Number,
        default: -1
    },
    keywordsId: String,
    director_chief_ids: Array,
    director_normal_ids: Array,
    director_co_ids: Array,
    actor_starring_ids: Array,
    actor_lead_ids: Array,
    actor_normal_ids: Array,
    screenwriter_ids: Array,
    screenwriter_chief_ids: Array,
    screenwriter_normal_ids: Array,
    screenwriter_co_ids: Array,
    douban_tags: Array,
    better_thans: Array,
    intro: String,
    stars: Array,
    production_countrys: Array,
    languages: Array,
    alias: Array,
    season: Number,
    mtime_id: String,
    pyname: String,
    comments_count: Number,
    reviews_count: Number,
});
FilmSchema.methods.getSites = function () {
    return __awaiter(this, void 0, void 0, function* () {
        let sites = yield film_plist_1.FilmPlist.find({ film_id: this._id, status: 0 });
        let site_data = sites.map(x => {
            return {
                site: x.site,
                csite: datamap[x.site],
                uri: x.uri
            };
        });
        return site_data;
    });
};
FilmSchema.methods.getCompany = function () {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.mtime_id) {
            let mtimeFilms = yield mtime_1.default.findOne({ film_id: this.mtime_id });
            let make_company;
            let release_company;
            let cost;
            let shooting_date;
            if (mtimeFilms && mtimeFilms.make_company) {
                make_company = mtimeFilms.make_company.map(company => company.company_name);
            }
            else {
                make_company = [];
            }
            if (mtimeFilms && mtimeFilms.release_company) {
                release_company = mtimeFilms.release_company.map(company => company.company_name);
            }
            else {
                release_company = [];
            }
            if (mtimeFilms && mtimeFilms.cost) {
                cost = mtimeFilms.cost;
            }
            else {
                cost = '';
            }
            if (mtimeFilms && mtimeFilms.shooting_date) {
                shooting_date = mtimeFilms.shooting_date;
            }
            else {
                shooting_date = '';
            }
            return {
                make_company,
                release_company,
                cost,
                shooting_date
            };
        }
        else {
            return {
                make_company: [],
                release_company: [],
                cost: '',
                shooting_date: ''
            };
        }
    });
};
FilmSchema.methods.getTvs = function () {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.tvs && this.tvs.length > 0) {
            let tvsArr = yield Promise.all(this.tvs.map((id) => __awaiter(this, void 0, void 0, function* () {
                let tv = yield tv_1.default.findOne({ _id: id });
                return tv.name;
            })));
            return tvsArr;
        }
        else {
            return [];
        }
    });
};
FilmSchema.methods.getStarInfo = function () {
    return __awaiter(this, void 0, void 0, function* () {
        let star = {
            directors: [],
            actors: [],
            screenwriters: [],
        };
        if (this.director_ids && this.director_ids.length > 0) {
            star.directors = yield Promise.all(this.director_ids.map((id) => __awaiter(this, void 0, void 0, function* () {
                let star = yield star_1.default.findOne({ douban_id: id });
                if (star) {
                    return star.cname;
                }
            })));
        }
        if (this.actor_ids && this.actor_ids.length > 0) {
            star.actors = yield Promise.all(this.actor_ids.map((id) => __awaiter(this, void 0, void 0, function* () {
                let star = yield star_1.default.findOne({ douban_id: id });
                if (star) {
                    return star.cname;
                }
            })));
        }
        if (this.screenwriter_ids && this.screenwriter_ids.length > 0) {
            star.screenwriters = yield Promise.all(this.screenwriter_ids.map((id) => __awaiter(this, void 0, void 0, function* () {
                let star = yield star_1.default.findOne({ douban_id: id });
                if (star) {
                    return star.cname;
                }
            })));
        }
        return star;
    });
};
const Film = mongoose.model('FILM', FilmSchema, 'films');
exports.Film = Film;
