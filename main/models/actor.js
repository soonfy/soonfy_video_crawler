"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const stars = new Schema({
    douban_id: String,
    cname: String,
    fname: String,
    sex: Number,
    constellation: String,
    birth_date: String,
    birth_death_date: String,
    birth_place: String,
    career: Array,
    other_cname: Array,
    other_fname: Array,
    family: Array,
    imdb_num: String,
    intro: String,
    photo: String,
    awards: Array,
    partners: Array,
    website: String,
    height: Number,
    weight: Number,
    weibo_id: String,
    graduation: String,
    fans: Number,
});
exports.default = mongoose.model('STAR', stars, 'stars');
