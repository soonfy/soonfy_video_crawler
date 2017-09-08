import * as moment from 'moment';
import * as mongoose from 'mongoose';

import { Film } from '../models/film';
import { FilmPlist } from '../models/film_plist';
import { CFilmPlistPlayCount } from '../models/c_film_plist_playcount';


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
const csites = ['爱奇艺', '腾讯', '乐视', '搜狐', '优酷', '芒果'];
const cates = ['体育', '电影', '电视剧', '综艺', '网络剧', '网络综艺', '民生新闻', '动画电影', '动画剧集', '纪录片', '自媒体', '网络大电影', '民生节目', '大型综艺晚会', '广告短片', '其它-电视台', '其它-网络节目', '其它-其它'];

const ensure_cate = (num) => {
  let cate = typeof num === 'number' ? cates[num] : cates.indexOf(num);
  return cate;
}

const ensure_dates = (start, end) => {
  let dates = [], temp = start.clone();
  while (temp <= end) {
    dates.push({
      date: temp.format('YYYY-MM-DD'),
      value: 0,
    });
    temp = temp.add(1, 'days');
  }
  // console.log(dates);
  return dates;
}

const ensure_plays = (plays, start, end) => {
  let dates = ensure_dates(start, end);
  return dates.map(x => {
    plays.map(play => {
      // console.log(x.date, play.date);
      if (moment(play.date).format('YYYY-MM-DD') === x.date) {
        x.value = play.value;
      }
    })
    return x;
  })
}

const dailer = async (film_id, start, end) => {
  try {
    let film = await Film.findById(film_id);
    if (!film) {
      console.error(`*****************`);
      console.error(`film id ${film_id} error.`);
      console.error(`*****************`);
      process.exit();
    } else {
      start = start === 0 ? moment(film.created_at) : typeof start === 'number' ? moment(new Date(end)).subtract(start, 'days') : moment(new Date(start));
      start = start.startOf('day');
      end = moment(new Date(end)).endOf('day');
      console.log(start);
      console.log(end);

      let result = [];
      let name = film.name,
        cate = ensure_cate(film.category) || '没有剧目类型数据';

      let dates = ensure_dates(start, end);
      if (film.show_type === 2) {
        console.log(`${name} 分年剧目...`);
        let films = await Film.find({ from_id: film_id, is_deleted: { $ne: true } });
        if (films.length > 0) {
          let promises = sites.map(async (site) => {
            let sum = [];
            for (let _film of films) {
              let _plays = [];
              let fp = await FilmPlist.findOne({ film_id: _film._id, site, status: 0 });
              if (!fp) {
                // _sum += 0;
              } else {
                _plays = await CFilmPlistPlayCount.find({ film_plist_id: fp._id, date: { $gte: start, $lte: end } });
              }
              _plays = ensure_plays(_plays, start, end);
              _plays.map((play, index) => {
                if (sum[index]) {
                  sum[index].value += play.value;
                } else {
                  sum[index] = play;
                }
              })
            }
            sum = sum.map((x, i, a) => {
              return {
                date: x.date,
                value: x.value - (a[i - 1] ? a[i - 1].value : 0)
              }
            });
            return sum;
          })
          let plays = await Promise.all(promises);
          dates.map((item, index) => {
            let _temp = [];
            plays.map(site => {
              _temp.push(site[index].value);
            })
            _temp.unshift(_temp.reduce((a, b) => a + b, 0));
            _temp.unshift(item.date);
            _temp.unshift(film_id);
            _temp.unshift(name);
            _temp.unshift(cate);
            result.push(_temp);
          })
          return result;
        } else {
          console.error(`*****************`);
          console.error(`${name} 分年剧目却没有找到分年子剧目...`);
          console.error(`*****************`);
          console.log(`${name} 采用不分年剧目导出...`);
          console.error(`*****************`);
          console.log(`${name} 不分年剧目...`);
          let promises = sites.map(async (site) => {
            let _plays = [];
            let fp = await FilmPlist.findOne({ film_id: film._id, site, status: 0 });
            if (!fp) {
              // return 0;
            } else {
              _plays = await CFilmPlistPlayCount.find({ film_plist_id: fp._id, date: { $gte: start, $lte: end } });
            }
            _plays = ensure_plays(_plays, start, end);
            _plays = _plays.map((x, i, a) => {
              return {
                date: x.date,
                value: x.value - (a[i - 1] ? a[i - 1].value : 0)
              }
            });
            return _plays;
          })
          let plays = await Promise.all(promises);
          dates.map((item, index) => {
            let _temp = [];
            plays.map(site => {
              _temp.push(site[index].value);
            })
            _temp.unshift(_temp.reduce((a, b) => a + b, 0));
            _temp.unshift(item.date);
            _temp.unshift(film_id);
            _temp.unshift(name);
            _temp.unshift(cate);
            result.push(_temp);
          })
          return result;
        }
      } else {
        console.log(`${name} 不分年剧目...`);
        let promises = sites.map(async (site) => {
          let _plays = [];
          let fp = await FilmPlist.findOne({ film_id: film._id, site, status: 0 });
          if (!fp) {
            // return 0;
          } else {
            _plays = await CFilmPlistPlayCount.find({ film_plist_id: fp._id, date: { $gte: start, $lte: end } });
          }
          _plays = ensure_plays(_plays, start, end);
          _plays = _plays.map((x, i, a) => {
            return {
              date: x.date,
              value: x.value - (a[i - 1] ? a[i - 1].value : 0)
            }
          });
          return _plays;
        })
        let plays = await Promise.all(promises);
        dates.map((item, index) => {
          let _temp = [];
          plays.map(site => {
            _temp.push(site[index].value);
          })
          _temp.unshift(_temp.reduce((a, b) => a + b, 0));
          _temp.unshift(item.date);
          _temp.unshift(film_id);
          _temp.unshift(name);
          _temp.unshift(cate);
          result.push(_temp);
        })
        return result;
      }
    }
  } catch (error) {
    console.error(error);
    process.exit();
  }
}

export default dailer
