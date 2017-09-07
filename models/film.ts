import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

const FilmSchema = new Schema({
  // film site
  name: {
    type: String,
  },
  category: Number,
  // film year
  year: {
    type: Number,
  },
  // film show type
  show_type: {
    // year = 1
    type: Number,
  },
  created_at: {
    type: Date,
  },

  /**
   *
   *  exporter
   *
   */
  // 
  is_deleted: Boolean,
  status: Number,
  // 关键词
  keywords: Array,
  // 百度指数关键词
  baidu_index_keyword: String,
  // 上映时间
  release_date: Date,
  // 收官日期
  ending_date: Date,
  // 电视台
  tvs: Array,
  // 分年剧目所属主剧目
  from_id: String,
  // 豆瓣类型
  douban_types: Array,
  // 导演
  director_ids: Array,
  // 演员
  actor_ids: Array,
  // 豆瓣评分
  rank: Number,
  // 评分人数
  rank_count: Number,
})

const Film = mongoose.model('FILM', FilmSchema, 'films');

export {
  Film
}