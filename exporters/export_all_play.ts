import * as path from 'path';

import * as moment from 'moment';
import * as mongoose from 'mongoose';
import * as filer from 'filer_sf';

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

const ensure_cate = (num) => {
  let cate = '';
  switch (num) {
    case 0:
      cate = '体育';
      break;
    case 1:
      cate = '电影';
      break;
    case 2:
      cate = '电视剧';
      break;
    case 3:
      cate = '综艺';
      break;
    case 4:
      cate = '网络剧';
      break;
    case 5:
      cate = '网络综艺';
      break;
    case 6:
      cate = '民生新闻';
      break;
    case 7:
      cate = '动画电影';
      break;
    case 8:
      cate = '动画剧集';
      break;
    case 9:
      cate = '纪录片';
      break;
    case 10:
      cate = '自媒体';
      break;
    case 11:
      cate = '网络大电影';
      break;
    case 12:
      cate = '民生节目';
      break;
    case 13:
      cate = '大型综艺晚会';
      break;
    case 14:
      cate = '广告短片';
    case 15:
      cate = '其它-电视台';
    case 16:
      cate = '其它-网络节目';
      break;
    case 17:
      cate = '其它-其它';
    default:
      break;
  }
  return cate;
}

const start = async () => {
  try {
    console.log(`==============`);
    console.log(`导出所有剧目指定日期总播放量和播放增量`);
    console.log(`==============`);
    let argv = process.argv[2];
    if (argv) {
      argv = argv.trim();
    } else {
      console.error(`*****************`);
      console.error(`input file path...`);
      console.error(`*****************`);
      process.exit();
    }
    let input = path.join(__dirname, `../../input/${argv}.xlsx`);
    let lines = filer.read(input);
    console.log(`==============`);
    console.log(`输入文件内容`);
    console.log(lines);
    console.log(`==============`);
    lines = lines['播放量'];
    lines.shift();
    let data = [['剧目类型', '剧目名称', '剧目id', '开始日期', '结束日期', '总播放量', '爱奇艺总播放量', '腾讯总播放量', '乐视总播放量', '搜狐总播放量', '优酷总播放量', '芒果总播放量', '期间播放增量', '爱奇艺期间播放增量', '腾讯期间播放增量', '乐视期间播放增量', '搜狐期间播放增量', '优酷期间播放增量', '芒果期间播放增量']];
    for (let line of lines) {
      let films, category = line[0] - 0;
      if (category === -1) {
        films = await Film.find({ status: 1, is_deleted: { $ne: true }, show_type: { $ne: 1 }, });
      } else {
        films = await Film.find({ category: category, status: 1, is_deleted: { $ne: true }, show_type: { $ne: 1 }, });
      }
      console.log(`总共 ${films.length} 条剧目。`);
      let _start = line[1],
        end = line[2].trim();
      end = moment(new Date(end)).endOf('day');
      for (let film of films) {
        let cate = ensure_cate(film.category);
        if (!cate) {
          console.error(`================`);
          console.error(`未匹配类型，已跳过。`);
          console.error(film);
          console.error(`================`);
          continue;
        } else {
          let name = film.name.trim(),
            film_id = film._id,
            start = _start === 0 ? moment(film.created_at) : typeof _start === 'number' ? moment(new Date(end)).subtract(_start - 1, 'days') : moment(new Date(_start.trim()));
          start = start.startOf('day');
          console.log(start);
          console.log(end);
          if (film.show_type === 2) {
            console.log(`${name} 分年剧目...`);
            let films = await Film.find({ from_id: film_id, is_deleted: { $ne: true } });
            if (films.length > 0) {
              let promises = sites.map(async (site) => {
                let _sum = 0,
                  _offset = 0;
                for (let _film of films) {
                  let fp = await FilmPlist.findOne({ film_id: _film._id, site, status: 0 });
                  if (!fp) {
                    // _sum += 0;
                  } else {
                    let last = await CFilmPlistPlayCount.findOne({ film_plist_id: fp._id, date: { $lte: end } }, '', { sort: { date: -1 } });
                    let last_l = await CFilmPlistPlayCount.findOne({ film_plist_id: fp._id, date: { $lte: start } }, '', { sort: { date: -1 } });
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
              let plays = await Promise.all(promises);
              let _line = line.slice(1, 3);
              _line.unshift(film_id);
              _line.unshift(name);
              _line.unshift(cate);
              let sum = plays.map(x => x._sum).reduce((a, b) => a + b, 0);
              _line.push(sum);
              _line = _line.concat(plays.map(x => x._sum));
              let offset = plays.map(x => x._offset).reduce((a, b) => a + b, 0);
              _line.push(offset);
              _line = _line.concat(plays.map(x => x._offset));
              data.push(_line);
              continue;
            } else {
              console.error(`*****************`);
              console.error(`${name} 分年剧目却没有找到分年子剧目...`);
              console.error(`*****************`);
              console.log(`${name} 采用不分年剧目导出...`);
              console.error(`*****************`);
            }
          }
          console.log(`${name} 不分年剧目...`);
          let promises = sites.map(async (site) => {
            let _sum = 0,
              _offset = 0;
            let fp = await FilmPlist.findOne({ film_id: film._id, site, status: 0 });
            if (!fp) {
              // return 0;
            } else {
              let last = await CFilmPlistPlayCount.findOne({ film_plist_id: fp._id, date: { $lte: end } }, '', { sort: { date: -1 } });
              let last_l = await CFilmPlistPlayCount.findOne({ film_plist_id: fp._id, date: { $lte: start } }, '', { sort: { date: -1 } });
              last = last ? last : { value: 0 };
              last_l = last_l ? last_l : { value: 0 };
              if (last) {
                _sum = last.value;
                _offset = last.value - last_l.value;
              }
            }
            return { _sum, _offset };
          })
          let plays = await Promise.all(promises);
          let sum = plays.map(x => x._sum).reduce((a, b) => a + b, 0);
          let _line = line.slice(1, 3);
          _line.unshift(film_id);
          _line.unshift(name);
          _line.unshift(cate);
          _line.push(sum);
          _line = _line.concat(plays.map(x => x._sum));
          let offset = plays.map(x => x._offset).reduce((a, b) => a + b, 0);
          _line.push(offset);
          _line = _line.concat(plays.map(x => x._offset));
          data.push(_line);
        }
      }
    }
    // console.log(data);
    let file = path.join(__dirname, `../../output/${argv}-sum-result.xlsx`);
    filer.write(file, data);
    console.log(`=================`);
    console.log(`file output ${file}`);
    console.log(`=================`);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit();
  }
}

start();
