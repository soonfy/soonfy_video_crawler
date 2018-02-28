"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const TVPlistSchema = new Schema({
    tv_name: {
        type: String,
    },
    film_name: {
        type: String,
    },
    film_uri: {
        type: String,
    },
    created_at: {
        type: Date,
    },
    crawled_status: {
        type: Number,
    },
    crawled_at: {
        type: Date,
    },
});
const TVPlist = mongoose.model('TVPLIST', TVPlistSchema, 'tv_plists');
exports.default = TVPlist;
