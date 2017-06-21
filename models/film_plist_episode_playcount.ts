import * as mongoose from 'mongoose';
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
})

const FilmPlistEpisodePlay = mongoose.model('FILMPLISTEPISODEPLAY', FilmPlistEpisodePlaySchema, 'film_plist_episode_playcounts');

export {
  FilmPlistEpisodePlay
}