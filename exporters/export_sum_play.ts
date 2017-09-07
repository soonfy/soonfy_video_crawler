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
const csites = ['爱奇艺', '腾讯', '乐视', '搜狐', '优酷', '芒果'];

const start = async () => {
  try {
    console.log(`==============`);
    console.log(`导出指定日期总播放量和播放增量`);
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
    let data = [['剧目类型', '剧目名称', '剧目id', '开始日期', '结束日期', '播出平台1', '播出平台2', '播出平台3', '播出平台4', '播出平台5', '播出平台6', '总播放量', '爱奇艺总播放量', '腾讯总播放量', '乐视总播放量', '搜狐总播放量', '优酷总播放量', '芒果总播放量', '期间播放增量', '爱奇艺期间播放增量', '腾讯期间播放增量', '乐视期间播放增量', '搜狐期间播放增量', '优酷期间播放增量', '芒果期间播放增量']];
    for (let line of lines) {
      let cate = typeof line[0] === 'number' ? line[0] : line[0].trim(),
        name = typeof line[1] === 'number' ? line[1] : line[1].trim(),
        film_id = typeof line[2] === 'number' ? line[2] : line[2].trim(),
        start = typeof line[3] === 'number' ? line[3] : line[3].trim(),
        end = typeof line[4] === 'number' ? line[4] : line[4].trim();
      // process.exit();
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
            let plays = await Promise.all(promises);
            let sum = plays.map(x => x._sum).reduce((a, b) => a + b, 0);
            let _line = line.slice(0, 5);
            let plats = plays.map((x, i) => x._sum ? csites[i] : '');
            _line = _line.concat(plats);
            _line.push(sum);
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
        let plays = await Promise.all(promises);
        let sum = plays.map(x => x._sum).reduce((a, b) => a + b, 0);
        let _line = line.slice(0, 5);
        let plats = plays.map((x, i) => x._sum ? csites[i] : '');
        _line = _line.concat(plats);
        _line.push(sum);
        _line = _line.concat(plays.map(x => x._sum));
        let offset = plays.map(x => x._offset).reduce((a, b) => a + b, 0);
        _line.push(offset);
        _line = _line.concat(plays.map(x => x._offset));
        data.push(_line);
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
