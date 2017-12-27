import * as path from 'path';

import * as moment from 'moment';
import * as mongoose from 'mongoose';
import * as filer from 'filer_sf';

import { Film } from '../models/film';
import { FilmPlist } from '../models/film_plist';
import { CFilmPlistPlayCount } from '../models/c_film_plist_playcount';
import TV from '../models/tv';
import Actor from '../models/actor';


/**
 *
 *  配置文件
 *
 */
let Config;
try {
  Config = require('../../config.json');
} catch (error) {
  try {
    Config = require('../config.json');
  } catch (error) {
    console.error(`配置文件 config.json 路径没找到`);
    process.exit();
  }
}
console.log(Config);
mongoose.connect(Config && Config.db && Config.db.uris);

const sites = ['iqiyi', 'qq', 'letv', 'sohu', 'youku', 'mgtv'];
const cates = ['体育', '电影', '电视剧', '综艺', '网络剧', '网络综艺', '民生新闻', '动画电影', '动画剧集', '纪录片', '自媒体', '网络大电影', '民生节目', '大型综艺晚会', '广告短片', '其它-电视台', '其它-网络节目', '其它-其它'];

const ensure_cate = (num) => {
  let cate = typeof num === 'number' ? cates[num] : cates.indexOf(num);
  return cate;
}

const start = async () => {
  try {
    let content = []
    await Promise.all(cates.map(async (cate, index) => {
      let name = cate;
      let films = await Film.find({ category: index, status: 1, is_deleted: { $ne: true } });
      let data = [['剧目类型', '剧目名称', '剧目id', '微博，微信，百度新闻关键词', '百度指数关键词', '上映年份', '开播日期', '收官日期', '电视台', '添加日期', '演员']];
      let film = films[0];

      let name = film.name;
      let filmid = film._id;
      let keyword = film.keywords.map(x => x.join('+')).join('||') || null;
      let baidu_index = film.baidu_index_keyword || null;
      let year = film.year || null;
      let start = film.release_date ? moment(film.release_date).format('YYYY-MM-DD') : null;
      let end = film.ending_date ? moment(film.ending_date).format('YYYY-MM-DD') : null;
      let store = film.created_date ? moment(film.created_date).format('YYYY-MM-DD') : null;


      let tvs = film.tvs && film.tvs.length > 0 ? await Promise.all(tvs.map(async (x) => (await TV.findOne({ _id: x })).name)) : null;
      let actors = film.actor_ids && film.actor_ids.length > 0 ? await Promise.all(actor_ids.map(async (x) => (await Actor.findOne({ douban_id: x })) ? (await Actor.findOne({ douban_id: x })).cname : '')) : null;



    }))

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit();
  }
}

start();
