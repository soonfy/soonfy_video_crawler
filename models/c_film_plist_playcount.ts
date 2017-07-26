import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

const CFilmPlistPlayCountSchema = new Schema({
  // film play count _id
  _id: {
    // film_plist_id:YYYY-MM-DD
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
  calculated_from: {
    // 0 - old db
    type: Number,
  },
  calculated_from_id: {
    // vs counts _id
    type: String,
  },
})

CFilmPlistPlayCountSchema.index({ film_plist_id: 1, date: 1 });

const CFilmPlistPlayCount = mongoose.model('CFILMPLISTPLAYCOUNT', CFilmPlistPlayCountSchema, 'c_film_plist_playcounts');

export {
  CFilmPlistPlayCount
}