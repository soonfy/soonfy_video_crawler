import * as path from 'path';
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

const format_date = (offset = 0, type = 'date') => {
  let stamp = Date.now();
  stamp = stamp - offset * 1000 * 60 * 60 * 24;
  let date = new Date(stamp);
  let year = date.getFullYear(),
    month = date.getMonth() + 1,
    day = date.getDate();
  month < 10 ? month = '0' + month : '';
  day < 10 ? day = '0' + day : '';
  // console.log(year, month, day);
  if (type === 'date') {
    return new Date(`${year}-${month}-${day}`);
  } else {
    return `${year}-${month}-${day}`;
  }
}

const start = async () => {
  try {
    let data = [['剧目名称', '日期', '网站', '播放增量']]
    let films = await Film.find({ created_at: { $gte: new Date('2017-07-28') } });
    console.log(films.length);
    for (let film of films) {
      let name = film.name;
      console.log(name);
      let fplist = await FilmPlist.find({ film_id: film._id });
      for (let fp of fplist) {
        // console.log(fp._id);
        let site = fp.site;
        let last = await CFilmPlistPlayCount.findOne({ film_plist_id: fp._id, date: format_date(1) });
        last = last ? last.value : 0;
        console.log(last);
        let lastl = await CFilmPlistPlayCount.findOne({ film_plist_id: fp._id, date: format_date(2) });
        lastl = lastl ? lastl.value : 0;
        console.log(lastl);
        let add = last - lastl
        data.push([name, format_date(1, 'string'), site, add])
      }
    }
    let file = path.join(__dirname, `../../logs/plays-${format_date(0, 'string')}.xlsx`);
    filer.write(file, data);
    process.exit();
  } catch (error) {
    console.error(error);
  }
}

start();
