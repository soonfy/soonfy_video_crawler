import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

const FilmPlistEpisodeSchema = new Schema({
  _id: {
    type: String,
  },
  film_plist_id: {
    type: String,
  },
  crawl_status: {
    type: Number,
  },
  created_at: {
    type: Date,
  },
  crawled_at: {
    type: Date,
  },
})

const FilmPlistEpisode = mongoose.model('FILMPLISTEPISODE', FilmPlistEpisodeSchema, 'film_plist_episodes');

export {
  FilmPlistEpisode
}