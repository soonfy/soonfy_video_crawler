"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const FilmPlistEpisodePlaySchema = new Schema({
    _id: {
        type: String,
    },
    film_plist_episode_id: {
        type: String,
    },
    date: {
        type: Date,
    },
    value: {
        type: Number,
    },
    created_at: {
        type: Date,
    },
    is_real: {
        type: Number,
    },
});
FilmPlistEpisodePlaySchema.index({ film_plist_episode_id: 1, date: 1 });
FilmPlistEpisodePlaySchema.index({ film_plist_episode_id: 1, is_real: 1, date: 1 });
const FilmPlistEpisodePlay = mongoose.model('FILMPLISTEPISODEPLAY', FilmPlistEpisodePlaySchema, 'film_plist_episode_playcounts');
exports.FilmPlistEpisodePlay = FilmPlistEpisodePlay;
