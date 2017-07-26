import * as mongoose from 'mongoose';
import * as moment from 'moment';

// /**
//  *
//  *  配置文件
//  *  数据库
//  *
//  */
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
import { FilmPlist } from '../models/film_plist';
import { CFilmPlistPlayCount } from '../models/c_film_plist_playcount';
import * as Crawlers from '../index';

const start = async () => {
  try {
    let OFFSET = 1000 * 60 * 60 * 24;
    console.log(`start fit film plays.`);
    let films = await FilmPlist.find();
    console.log(films.length);
    let index = 0;
    for (let film of films) {
      console.log(++index);
      // if (index < 2900) {
      //   continue;
      // }
      console.log(film);
      let counts = await CFilmPlistPlayCount.find({ film_plist_id: film._id }).sort({ date: 1 });
      for (let index = 0, len = counts.length; index < len - 1; index++) {
        if (counts[index + 1].date - counts[index].date > OFFSET) {
          let old_play = counts[index], new_play = counts[index + 1];
          console.log(old_play);
          console.log(new_play);
          let film_plist_id = old_play.film_plist_id,
            start = old_play.date,
            end = new_play.date,
            count = Math.floor((end - start) / OFFSET),
            diff = new_play.value - old_play.value,
            inc = Math.floor(diff / count),
            _index = 1;
          console.log(`--> ${film_plist_id} 缺失 ${count - 1} 天数据.`);
          while (_index < count) {
            let cal = moment(end - OFFSET * _index).format('YYYY-MM-DD');
            let date = new Date(cal);
            let value = new_play.value - inc * _index
            let _play = {
              _id: `${film_plist_id}:${cal}`,
              film_plist_id,
              date,
              value,
              calculated_at: new Date(),
              calculated_from: 0,
              calculated_from_id: 'fit data',
            }
            let resp = await CFilmPlistPlayCount.findByIdAndUpdate(_play._id, {
              $set: _play
            }, {
                upsert: true,
                new: true
              })
            console.log(`--> 第 ${_index} 次拟合成功`, resp._id, resp.value);
            _index++;
          }
          console.log(`--> 数据全部拟合成功`);
        }
      }
    }
    console.log(`all films fit over.`);
    process.exit();
  } catch (error) {
    console.error(error);
  }
}

start();
