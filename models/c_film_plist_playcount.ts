import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

const CFilmPlistPlayCountSchema = new Schema({
  // film play count _id
  _id: {
    // film_plist_id:YYYYMMDD
    type: String,
  },
  // film plist _id
  film_plist_id: {
    type: String,
  },
  // date
  date: {
    type: Date,
  },
  // play count
  value: {
    type: Number,
  },
  // calculate time
  calculated_at: {
    type: Date,
  },
})

const CFilmPlistPlayCount = mongoose.model('CFILMPLISTPLAYCOUNT', CFilmPlistPlayCountSchema, 'c_film_plist_playcounts');

export {
  CFilmPlistPlayCount
}