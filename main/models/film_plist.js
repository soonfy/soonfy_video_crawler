"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const FilmPlistSchema = new Schema({
    film_id: {
        type: String,
    },
    site: {
        type: String,
    },
    uri: {
        type: String,
    },
    label: {
        type: String,
    },
    status: {
        type: Number,
    },
    created_at: {
        type: Date,
    },
    updated_at: {
        type: Date,
    },
    crawled_status: {
        type: Number,
    },
    crawled_at: {
        type: Date,
    },
});
FilmPlistSchema.index({ film_id: 1, site: 1, status: 1 });
FilmPlistSchema.index({ crawled_status: 1, crawled_at: 1 });
const FilmPlist = mongoose.model('FILMPLIST', FilmPlistSchema, 'film_plists');
exports.FilmPlist = FilmPlist;
