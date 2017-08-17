import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

const TVPlistSchema = new Schema({
  tv_name: {
    type: String,
  },
  film_name: {
    type: String,
  },
  film_uri: {
    type: String,
  },
  created_at: {
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


const TVPlist = mongoose.model('TVPLIST', TVPlistSchema, 'tv_plists');

export default TVPlist;