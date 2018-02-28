"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const FilmDetailSchema = new Schema({
    filmId: {
        type: String,
        index: true
    },
    name: {
        type: String
    },
    allUrl: {
        type: String
    },
    category: {
        type: Number,
        index: true
    },
    site: {
        type: String,
        index: true
    },
    nowEpisodes: {
        type: Number
    },
    sofrom: {
        type: Array,
        default: []
    },
    updatedAt: {
        type: Date,
        default: new Date(0)
    },
    status: {
        type: Number,
        index: true
    },
    synchronize: {
        type: Object,
        default: {}
    },
    showType: {
        type: Number,
    },
    year: {
        type: Number,
    },
    leInfos: {
        type: Object,
        default: {}
    },
    playUrls: {
        type: Array,
        default: []
    },
    youkuInfos: {
        type: Object,
        default: {}
    },
    baiduInfos: {
        type: Object,
        default: {}
    },
    iqiyiInfos: {
        type: Object,
        default: {}
    },
    mgtvInfos: {
        type: Object,
        default: {}
    },
    tudouInfos: {
        type: Object,
        default: {}
    },
    sohuInfos: {
        type: Object,
        default: {}
    },
    qqInfos: {
        type: Object,
        default: {}
    },
    isDeleted: {
        type: Boolean
    },
    lastCrawledAt: {
        type: Date,
        default: new Date('2017-03-02')
    },
    blblInfos: {
        type: Object,
        default: {}
    },
    acfunInfos: {
        type: Object,
        default: {}
    },
    pptvInfos: {
        type: Object,
        default: {}
    }
});
const FilmDetail = mongoose.model('FILMDETAIL', FilmDetailSchema, 'film_details');
exports.FilmDetail = FilmDetail;
