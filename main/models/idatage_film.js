"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const IdatageFilmSchema = new Schema({
    doubanId: {
        type: String,
    },
    name: {
        type: String,
    },
    category: {
        type: Number,
    },
    keywords: {
        type: Array
    },
    doubanTags: {
        type: Array
    },
    moviePic: {
        type: String,
    },
    year: {
        type: Number,
    },
    doubanTypes: {
        type: Array
    },
    releaseDate: {
        type: Date,
    },
    directorIds: {
        type: Array,
    },
    screenwriterIds: {
        type: Array,
    },
    actorIds: {
        type: Array
    },
    duration: {
        type: Number
    },
    rank: {
        type: Number,
    },
    rankCount: {
        type: Number,
    },
    betterThan: {
        type: Array
    },
    intro: {
        type: String
    },
    stars: {
        type: Array
    },
    isDeleted: {
        type: Boolean,
    },
    status: {
        type: Number,
    },
    productionCountry: {
        type: Array
    },
    language: {
        type: Array
    },
    alias: {
        type: Array
    },
    season: {
        type: Number
    },
    episode: {
        type: Number
    },
    singlelength: {
        type: Number
    },
    IMDbLink: {
        type: Object
    },
    webSite: {
        type: Object
    },
    updatedAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
    },
    updatedBy: {
        type: String,
    },
    createdBy: {
        type: String,
    },
    keywordsId: {
        type: String,
    },
    isKeywordChanged: {
        type: Boolean,
    },
    topStatus: {
        type: Number,
    },
    day_top_status: {
        type: Number,
    },
    showType: {
        type: Number,
    },
    from_id: {
        type: String
    },
    group: {
        type: Number
    },
    fromId: {
        type: String,
    },
    endingDate: {
        type: Date,
    },
    tvs: {
        type: Array,
    },
    pyname: {
        type: String,
    },
    last_crawl_at: {
        type: Date,
    },
    crawl_status: {
        type: Number,
    }
});
const IdatageFilm = mongoose.model('IDATAGEFILM', IdatageFilmSchema, 'idatage_films');
exports.IdatageFilm = IdatageFilm;
