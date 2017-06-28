import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

const FilmPlistEpisodePlaySchema = new Schema({
  // film episode play _id
  _id: {
    // film_plist_episode_id:YYYY-MM-DD
    type: String,
  },
  // film plist episode id
  film_plist_episode_id: {
    type: String,
  },
  // date
  date: {
    type: Date,
  },
  // play value
  value: {
    type: Number,
  },
  // create time
  created_at: {
    type: Date,
  },
  // real or not
  is_real: {
    // 1 - real, 0 - not
    type: Number,
  },
})

// index
FilmPlistEpisodePlaySchema.index({ film_plist_episode_id: 1, date: 1});
FilmPlistEpisodePlaySchema.index({ film_plist_episode_id: 1, is_real: 1, date: 1});

const FilmPlistEpisodePlay = mongoose.model('FILMPLISTEPISODEPLAY', FilmPlistEpisodePlaySchema, 'film_plist_episode_playcounts');

export {
  FilmPlistEpisodePlay
}