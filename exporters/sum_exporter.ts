import * as moment from 'moment';
import * as mongoose from 'mongoose';

import { Film } from '../models/film';
import { FilmPlist } from '../models/film_plist';
import { CFilmPlistPlayCount } from '../models/c_film_plist_playcount';
import TV from '../models/tv';

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

const sites = ['iqiyi', 'qq', 'letv', 'sohu', 'youku', 'mgtv', 'pptv'];
const csites = ['爱奇艺', '腾讯', '乐视', '搜狐', '优酷', '芒果', 'PPTV'];
const cates = ['体育', '电影', '电视剧', '综艺', '网络剧', '网络综艺', '民生新闻', '动画电影', '动画剧集', '纪录片', '自媒体', '网络大电影', '民生节目', '大型综艺晚会', '广告短片', '其它-电视台', '其它-网络节目', '其它-其它'];

const ensure_cate = (num) => {
  let cate = typeof num === 'number' ? cates[num] : cates.indexOf(num);
  return cate;
}

const summer = async (film_id, start, end) => {
  try {
    let film = await Film.findById(film_id);
    if (!film) {
      console.error(`*****************`);
      console.error(`film id ${film_id} error.`);
      console.error(`*****************`);
      process.exit();
    } else {
      start = start === 0 ? moment(film.created_at) : typeof start === 'number' ? moment(new Date(end)).subtract(start - 1, 'days') : moment(new Date(start));
      start = start.startOf('day');
      end = moment(new Date(end)).endOf('day');
      console.log(start);
      console.log(end);
      let result = [];

      let name = film.name,
        cate = ensure_cate(film.category) || '没有剧目类型数据',
        year = film.year || '没有上映年份数据',
        tvs = film.tvs,
        tv_count = 0,
        release_date = film.release_date ? moment(film.release_date).format('YYYY-MM-DD') : '没有开播日期',
        ending_date = film.ending_date ? moment(film.ending_date).format('YYYY-MM-DD') : '没有收官日期';
      if (tvs && tvs.length > 0) {
        tvs = await Promise.all(tvs.map(async (x) => (await TV.findOne({ _id: x })).name));
        tv_count = tvs.length;
      } else {
        tvs = ['没有电视台数据'];
      }

      let show_type;      
      let {episode, rank} = film;      

      let plays, sum, offset, plats, plat_count;

      if (film.show_type === 2) {
        show_type = '分年';
        console.log(`${name} 分年剧目...`);
        let films = await Film.find({ from_id: film_id, is_deleted: { $ne: true } });
        console.log(`子剧目 - ${films.length} 个`);
        if (films.length > 0) {
          let promises = sites.map(async (site) => {
            let _sum = 0,
              _offset = 0;
            for (let _film of films) {
              let fp = await FilmPlist.findOne({ film_id: _film._id, site, status: 0 });
              if (!fp) {
                // _sum += 0;
              } else {
                let last = await CFilmPlistPlayCount.findOne({ film_plist_id: fp._id, date: { $lte: end, $gte: start } }, '', { sort: { date: -1 } });
                let last_l = await CFilmPlistPlayCount.findOne({ film_plist_id: fp._id, date: { $lte: end, $gte: start } }, '', { sort: { date: 1 } });
                last = last ? last : { value: 0 };
                last_l = last_l ? last_l : { value: 0 };
                if (last) {
                  _sum += last.value;
                  _offset += (last.value - last_l.value);
                } else {
                  // _sum += 0;
                }
              }
            }
            return { _sum, _offset };
          })
          plays = await Promise.all(promises);
        } else {
          show_type = '分年，没有子剧目';
          console.error(`*****************`);
          console.error(`${name} 分年剧目却没有找到分年子剧目...`);
          console.error(`*****************`);
          console.log(`${name} 采用不分年剧目导出...`);
          console.error(`*****************`);
          console.log(`${name} 不分年剧目...`);
          let promises = sites.map(async (site) => {
            let _sum = 0,
              _offset = 0;
            let fp = await FilmPlist.findOne({ film_id: film._id, site, status: 0 });
            if (!fp) {
              // return 0;
            } else {
              let last = await CFilmPlistPlayCount.findOne({ film_plist_id: fp._id, date: { $lte: end, $gte: start } }, '', { sort: { date: -1 } });
              let last_l = await CFilmPlistPlayCount.findOne({ film_plist_id: fp._id, date: { $lte: end, $gte: start } }, '', { sort: { date: 1 } });
              last = last ? last : { value: 0 };
              last_l = last_l ? last_l : { value: 0 };
              if (last) {
                _sum = last.value;
                _offset = last.value - last_l.value;
              }
            }
            return { _sum, _offset };
          })
          plays = await Promise.all(promises);
        }
      } else {
        show_type = '不分年';
        console.log(`${name} 不分年剧目...`);
        let promises = sites.map(async (site) => {
          let _sum = 0,
            _offset = 0;
          let fp = await FilmPlist.findOne({ film_id: film._id, site, status: 0 });
          if (!fp) {
            // return 0;
          } else {
            let last = await CFilmPlistPlayCount.findOne({ film_plist_id: fp._id, date: { $lte: end, $gte: start } }, '', { sort: { date: -1 } });
            let last_l = await CFilmPlistPlayCount.findOne({ film_plist_id: fp._id, date: { $lte: end, $gte: start } }, '', { sort: { date: 1 } });
            last = last ? last : { value: 0 };
            last_l = last_l ? last_l : { value: 0 };
            if (last) {
              _sum = last.value;
              _offset = last.value - last_l.value;
            }
          }
          return { _sum, _offset };
        })
        plays = await Promise.all(promises);
      }

      sum = plays.map(x => x._sum).reduce((a, b) => a + b, 0),
        offset = plays.map(x => x._offset).reduce((a, b) => a + b, 0),
        plats = plays.map((x, i) => x._sum ? csites[i] : ''),
        plat_count = plats.filter(x => x).length;

      result = [cate, name, film_id, rank, show_type, episode, moment(start).format('YYYY-MM-DD'), moment(end).format('YYYY-MM-DD'), plat_count];
      result = result.concat(plats);
      result.push(sum);
      result = result.concat(plays.map(x => x._sum));
      result.push(offset);
      result = result.concat(plays.map(x => x._offset));
      result = result.concat([year, release_date, ending_date, tv_count, tvs.join(' ; ')]);
      return result;
    }
  } catch (error) {
    console.error(error);
    process.exit();
  }
}

export default summer
