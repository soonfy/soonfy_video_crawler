import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

const FilmPlistSchema = new Schema({
  // idatage film _id
  film_id: {
    type: String,
  },
  // film site
  site: {
    type: String,
  },
  // film uri
  uri: {
    type: String,
  },
  // film uri status
  status: {
    // 0 - right, crawler using
    type: Number,
  },
  // create time
  created_at: {
    type: Date,
  },
  // update time
  updated_at: {
    type: Date,
  },
  // crawl status
  crawled_status: {
    // 0 - ready, 1 - crawling, -1 - error
    type: Number,
  },
  // crawl time
  crawled_at: {
    type: Date,
  },
})

// index
FilmPlistSchema.index({ film_id: 1, site: 1, status: 1 });
FilmPlistSchema.index({ crawled_status: 1, crawled_at: 1 });

const FilmPlist = mongoose.model('FILMPLIST', FilmPlistSchema, 'film_plists');

export {
  FilmPlist
}