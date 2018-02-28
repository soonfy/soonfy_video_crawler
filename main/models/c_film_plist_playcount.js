"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const CFilmPlistPlayCountSchema = new Schema({
    _id: {
        type: String,
    },
    film_plist_id: {
        type: String,
    },
    date: {
        type: Date,
    },
    value: {
        type: Number,
    },
    calculated_at: {
        type: Date,
    },
    calculated_from: {
        type: Number,
    },
    calculated_from_id: {
        type: String,
    },
});
CFilmPlistPlayCountSchema.index({ film_plist_id: 1, date: 1 });
const CFilmPlistPlayCount = mongoose.model('CFILMPLISTPLAYCOUNT', CFilmPlistPlayCountSchema, 'c_film_plist_playcounts');
exports.CFilmPlistPlayCount = CFilmPlistPlayCount;
