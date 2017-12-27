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
  // 集数
  episode: Number,
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

  douban_id: String, // 豆瓣id
  // 类别「-1 未分类 0 体育 1 电影 2 电视剧
  // 3 综艺 4 网络剧 5 网络综艺 
  // 6 民生新闻 7 动画电影 8 动画剧集
  // 9 纪录片 10 自媒体 11 网络大电影
  // 12 民生节目 13 大型综艺晚会 14 广告短片
  // 15 其他-电视台 16 其他-网络节目 17 其他-其他」
  first_play: String, // 首轮播出电视台
  make_category: {
    type: Number,
    default: -1
  }, // 制作类型 「-1 未分类 0 网站自制 1 联合制作 2 网站采购 3 其他」
  keywordsId: String,
  director_chief_ids: Array, // 导演-总导演
  director_normal_ids: Array, // 导演-导演
  director_co_ids: Array, // 导演-联合导演
  actor_starring_ids: Array, // 演员-领衔主演
  actor_lead_ids: Array, // 演员-主演
  actor_normal_ids: Array, // 演员-参演
  screenwriter_ids: Array, // 编剧
  screenwriter_chief_ids: Array, // 编剧-总编剧
  screenwriter_normal_ids: Array, // 编剧-编剧
  screenwriter_co_ids: Array, // 编剧-联合编剧
  douban_tags: Array, // 豆瓣成员常用标签
  better_thans: Array, // 好于同类百分比
  intro: String, // 简介
  stars: Array, // 豆瓣评分分布
  production_countrys: Array, // 制作地区
  languages: Array, // 语言
  alias: Array, // 别名
  season: Number, // 电视剧或者综艺季数
  // release_company: Array, // 出品公司
  // make_company: Array, // 制作公司
  mtime_id: String, // 时光网id
  pyname: String, // 剧目名拼音

  //新增两个
  comments_count: Number, // 短评
  reviews_count: Number,  // 影评
})

const Film = mongoose.model('FILM', FilmSchema, 'films');

export {
  Film
}