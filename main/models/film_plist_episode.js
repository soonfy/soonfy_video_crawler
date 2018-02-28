"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const FilmPlistEpisodeSchema = new Schema({
    _id: {
        type: String,
    },
    film_plist_id: {
        type: String,
    },
    created_at: {
        type: Date,
    },
});
FilmPlistEpisodeSchema.index({ film_plist_id: 1 });
const FilmPlistEpisode = mongoose.model('FILMPLISTEPISODE', FilmPlistEpisodeSchema, 'film_plist_episodes');
exports.FilmPlistEpisode = FilmPlistEpisode;
