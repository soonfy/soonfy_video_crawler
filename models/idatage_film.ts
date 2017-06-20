import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

const IdatageFilmSchema = new Schema({
  // objectId: String,
  // 豆瓣id
  doubanId: {
    type: String,
  },
  // 豆瓣名字
  name: {
    type: String,
  },
  // 类别「0 体育 1 电影 2 电视剧，3 综艺  4 网络剧  5 网络综艺  6 民生新闻  7 动画电影  8 动画剧集  9纪录片  10自媒体」
  category: {
    type: Number,
  },
  // 研究关键字
  keywords: {
    type: Array
  },
  // title:String,
  // 豆瓣成员常用的标签
  doubanTags: {
    type: Array
  },
  // 豆瓣剧目头像 url
  moviePic: {
    type: String,
  },
  // 年份
  year: {
    type: Number,
  },
  doubanTypes: {
    type: Array
  },
  // 发布时间
  releaseDate: {
    type: Date,
  },
  directorIds: {
    type: Array,
  }, //导演 #i
  screenwriterIds: {
    type: Array,
  }, //编剧 #i
  actorIds: {
    type: Array
  }, //演员 #i
  duration: {
    type: Number
  }, //电影时长
  rank: {
    type: Number,
  }, //平均得分 #i
  rankCount: {
    type: Number,
  }, //评分人数 #i
  betterThan: {
    type: Array
  }, //好于同类百分比
  intro: {
    type: String
  }, //简介
  stars: {
    type: Array
  }, //得分分数分布
  // created_at_time: {
  //   type: Date,
  //   index: true
  // },
  isDeleted: { //是否已删除
    type: Boolean,
  },
  //新增一些字段
  status: {
    type: Number,
  },
  // 制作地区
  productionCountry: {
    type: Array
  },
  //语言
  language: {
    type: Array
  }, //暂时是string，没有发现同时有两种语言的，但是有可能有
  //别名
  alias: {
    type: Array
  },
  //电视剧或者综艺季数
  season: {
    type: Number
  },
  //电视剧 集数
  episode: {
    type: Number
  },
  //电视剧 单集时间
  singlelength: {
    type: Number
  },
  //IMDb链接
  IMDbLink: {
    type: Object
  },
  //官方网站
  webSite: {
    type: Object
  },
  updatedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
  },
  updatedBy: {
    type: String,
  },
  createdBy: {
    type: String,
  },
  keywordsId: {
    type: String,
  },
  isKeywordChanged: {
    type: Boolean,
  },
  topStatus: {
    type: Number,
  },
  day_top_status: {
    type: Number,
  },
  showType: {
    type: Number,
  },
  from_id: {
    type: String
  },
  group: {
    type: Number
  },
  fromId: {
    type: String,
  },
  // 收官时间
  endingDate: {
    type: Date,
  },
  // 播出电视台
  tvs: {
    type: Array,
  },
  pyname: {
    type: String,
  },
  last_crawl_at: {
    // 最近采集时间
    type: Date,
  },
  crawl_status: {
    // 采集状态，0等待, 1正在
    type: Number,
  }
})

const IdatageFilm = mongoose.model('IDATAGEFILM', IdatageFilmSchema, 'idatage_films');

export {
  IdatageFilm
}