import * as mongoose from 'mongoose';
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
  status: {
    type: Number,
  },
  created_at: {
    type: Date,
  },
})

const FilmPlist = mongoose.model('FILMPLIST', FilmPlistSchema, 'film_plists');

export {
  FilmPlist
}