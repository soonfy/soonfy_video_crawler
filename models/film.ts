import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

import { FilmPlist } from './film_plist'

import TV from '../models/tv';
import Mtime from './mtime';
import Star from './star';

const datamap = {
  iqiyi: '爱奇艺',
  letv: '乐视视频',
  mgtv: '芒果TV',
  qq: '腾讯视频',
  sohu: '搜狐视频',
  tudou: '土豆网',
  youku: '优酷',
  pptv: 'pptv',
  '爱奇艺': 'iqiyi',
  '乐视视频': 'letv',
  '芒果TV': 'mgtv',
  '腾讯视频': 'qq',
  '搜狐视频': 'sohu',
  '土豆网': 'tudou',
  '优酷': 'youku',
}


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


FilmSchema.methods.getSites = async function () {
  let sites = await FilmPlist.find({ film_id: this._id, status: 0 });
  let site_data = sites.map(x => {
    return {
      site: x.site,
      csite: datamap[x.site],
      uri: x.uri
    }
  })
  return site_data
}

FilmSchema.methods.getCompany = async function () {
  if (this.mtime_id) {
    let mtimeFilms = await Mtime.findOne({ film_id: this.mtime_id })
    let make_company
    let release_company
    let cost
    let shooting_date
    if (mtimeFilms && mtimeFilms.make_company) {
      make_company = mtimeFilms.make_company.map(company => company.company_name)
    } else {
      make_company = []
    }
    if (mtimeFilms && mtimeFilms.release_company) {
      release_company = mtimeFilms.release_company.map(company => company.company_name)
    } else {
      release_company = []
    }
    if (mtimeFilms && mtimeFilms.cost) {
      cost = mtimeFilms.cost
    } else {
      cost = ''
    }
    if (mtimeFilms && mtimeFilms.shooting_date) {
      shooting_date = mtimeFilms.shooting_date
    } else {
      shooting_date = ''
    }

    return {
      make_company,
      release_company,
      cost,
      shooting_date
    }
  } else {
    return {
      make_company: [],
      release_company: [],
      cost: '',
      shooting_date: ''
    }
  }
}

FilmSchema.methods.getTvs = async function () {
  if (this.tvs && this.tvs.length > 0) {
    let tvsArr = await Promise.all(this.tvs.map(async (id) => {
      let tv = await TV.findOne({ _id: id })
      return tv.name
    }))
    return tvsArr
  } else {
    return []
  }
}

FilmSchema.methods.getStarInfo = async function () {

  let star = {
    directors: [],
    actors: [],
    screenwriters: [],
  }
  if (this.director_ids && this.director_ids.length > 0) {
    star.directors = await Promise.all(this.director_ids.map(async (id) => {
      let star = await Star.findOne({ douban_id: id })
      if (star) {
        return star.cname
      }
    }))
  }

  if (this.actor_ids && this.actor_ids.length > 0) {
    star.actors = await Promise.all(this.actor_ids.map(async (id) => {
      let star = await Star.findOne({ douban_id: id })
      if (star) {
        return star.cname
      }
    }))
  }

  if (this.screenwriter_ids && this.screenwriter_ids.length > 0) {
    star.screenwriters = await Promise.all(this.screenwriter_ids.map(async (id) => {
      let star = await Star.findOne({ douban_id: id })
      if (star) {
        return star.cname
      }
    }))
  }

  return star;
}


const Film = mongoose.model('FILM', FilmSchema, 'films');


export {
  Film
}