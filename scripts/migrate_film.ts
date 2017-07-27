/**
 *
 *  从旧数据库迁移剧目
 *
 */
import * as mongoose from 'mongoose';
import * as moment from 'moment';

/**
 *
 *  配置文件
 *  数据库
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
mongoose.connect(Config && Config.db && Config.db.uris);
import { FilmPlist } from '../models/film_plist';
import { FilmDetail } from '../models/film_detail';
import * as Crawlers from '../index';

const start = async () => {
  try {
    console.log(`start migrate film details.`);
    // let film = await FilmDetail.find({ site: 'letv' }).limit(10);
    // console.log(film);

    let films = await FilmDetail.find({ status: { $gte: 0 }, isDeleted: { $ne: true } });
    console.log(films.length);
    let index = 0;
    for (let film of films) {
      console.log(++index);
      console.log(film);
      let {filmId: film_id, name, site, showType: show_type, year} = film,
        uri = '';
      console.log(film_id, name, site, show_type, year);
      switch (site) {
        case 'iqiyi':
          uri = film.iqiyiInfos && film.iqiyiInfos.iqiyiuri;
          break;
        case 'qq':
          uri = film.qqInfos && film.qqInfos.qquri;
          break;
        case 'letv':
          uri = film.leInfos && film.leInfos.leuri;
          break;
        case 'sohu':
          uri = film.sohuInfos && film.sohuInfos.sohuuri;
          break;
        case 'youku':
          uri = film.youkuInfos && film.youkuInfos.youkuuri;
          break;
        case 'mgtv':
          uri = film.mgtvInfos && film.mgtvInfos.mgtvuri;
          break;
        case 'pptv':
          uri = film.pptvInfos && film.pptvInfos.pptvuri;
          break;

        default:
          console.error('no find site.', site);
          uri = 'site error';
          break;
      }
      console.log(uri);
      if (!uri || uri === 'site error') {
        continue;
      } else {
        let _film = await FilmPlist.findOneAndUpdate({ film_id, site }, { $set: { crawled_status: 0 } })
        console.log(_film);
      }
      // let _film = {
      //   film_id,
      //   site,
      //   uri,
      //   show_type,
      //   year
      // }
      // console.log(_film);
      // let cfilm = await Crawlers.main(_film);
      // console.log(cfilm);
    }
    console.log(`all films migrate over.`);
    process.exit();
  } catch (error) {
    console.error(error);
  }
}

start();