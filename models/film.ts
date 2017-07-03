import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

const FilmSchema = new Schema({
  // film site
  name: {
    type: String,
  },
  // film year
  year: {
    type: Number,
  },
  // film show type
  show_type: {
    // year = 1
    type: Number,
  },
})

const Film = mongoose.model('FILM', FilmSchema, 'films');

export {
  Film
}