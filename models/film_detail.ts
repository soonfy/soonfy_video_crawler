import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

const FilmDetailSchema = new Schema({
  filmId: {
    type: String,
    index: true
  },
  name: {
    type: String
  },
  allUrl: {
    type: String
  },
  category: {
    type: Number,
    index: true
  },
  site: {
    type: String,
    index: true
  },
  nowEpisodes: {
    type: Number
  },
  sofrom: {
    type: Array,
    default: []
  },
  updatedAt: {
    type: Date,
    default: new Date(0)
  },
  // -1 已删除, -2 待检测, -3 废弃, 0 未验证, 1 验证成功
  status: {
    type: Number,
    index: true
  },
  synchronize: {
    type: Object,
    default: {}
  },
  showType: {
    type: Number,
  },
  leInfos: {
    type: Object,
    default: {}
    // {
    //   letvOriginalId
    //   vrsAid
    //   aid
    // }
  },
  playUrls: {
    type: Array,
    default: []
  },
  youkuInfos: {
    type: Object,
    default: {}
    // {
    //   youkuuri
    //   youkuid
    // }
  },
  baiduInfos: {
    type: Object,
    default: {}
    // {
    //   letvOriginalId
    //   vrsAid
    //   aid
    // }
  },
  iqiyiInfos: {
    type: Object,
    default: {}
    // {
    //   iqiyiuri
    //   iqiyivid
    //   iqiyicid
    //   iqiyiyear
    //   iqiyiIds
    // }
  },
  mgtvInfos: {
    type: Object,
    default: {}
    // {
    //   mgtvuri
    //   mgtvid
    // }
  },
  tudouInfos: {
    type: Object,
    default: {}
    // {
    //   tudouuri
    // }
  },
  sohuInfos: {
    type: Object,
    default: {}
    // {
    //   sohuuri
    // }
  },
  qqInfos: {
    type: Object,
    default: {}
    // {
    //   qquri
    // }
  },
  isDeleted: {
    type: Boolean
  },
  lastCrawledAt: {
    type: Date,
    default: new Date('2017-03-02')
  },
  blblInfos: {
    type: Object,
    default: {}
    // {
    //   blbluri
    // }
  },
  acfunInfos: {
    type: Object,
    default: {}
    // {
    //    acfunuri
    // }
  },
  pptvInfos: {
    type: Object,
    default: {}
    // {
    //   pptvuri
    // }
  }
})

const FilmDetail = mongoose.model('FILMDETAIL', FilmDetailSchema, 'film_details');

export {
  FilmDetail
}

// switch (this.site) {
//   case 'mgtv':
//     plu = (this.mgtvInfos && this.mgtvInfos.mgtvuri)
//     break
//   case "youku":
//     plu = (this.youkuInfos && this.youkuInfos.youkuuri)
//     break;
//   case "tudou":
//     plu = (this.tudouInfos && this.tudouInfos.tudouuri)
//     break;
//   case "letv":
//     plu = (this.leInfos && this.leInfos.leuri)
//     break
//   case "bilibili":
//     plu = (this.blblInfos && this.blblInfos.blbluri)
//     break;
//   case "acfun":
//     plu = (this.acfunInfos && this.acfunInfos.acfunuri)
//     break;
//   case "pptv":
//     plu = (this.pptvInfos && this.pptvInfos.pptvuri)
//     break;
//   case 'iqiyi':
//     plu = (this.iqiyiInfos && this.iqiyiInfos.iqiyiuri)
//     break;
//   case 'sohu':
//     plu = (this.sohuInfos && this.sohuInfos.sohuuri)
//     break;
//   case 'qq':
//     plu = (this.qqInfos && this.qqInfos.qquri)
//     break;
//   default:
//     plu = dft()