import * as mongoose from 'mongoose';
import * as moment from 'moment';
import * as _ from 'lodash';
import * as fs from 'fs';

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
import { FilmPlistEpisode } from '../models/film_plist_episode';
import { FilmPlistEpisodePlay } from '../models/film_plist_episode_playcount';
import { CFilmPlistPlayCount } from '../models/c_film_plist_playcount';

const find_id = async () => {
  try {
    console.log(`start find film ids.`);

    let pe_films = await FilmPlistEpisode.distinct('film_plist_id');
    console.log(pe_films.length);
    console.log(pe_films[0]);
    let index = 0;
    // let cpp_films = await CFilmPlistPlayCount.distinct('film_plist_id');
    // console.log(cpp_films.length);
    for (let id of pe_films) {
      console.log(++index);
      let film = await FilmPlist.findById(id);
      if (!film) {
        console.log(id);
        fs.appendFileSync('./ids.txt', id + '\n');
      }
    }
    // let films = await FilmPlist.distinct('_id');
    // console.log(films.length);
    // console.log(films[0]);

    console.log(`find films ids over.`);
    process.exit();
  } catch (error) {
    console.error(error);
  }
}

const drop_episode = async () => {
  try {
    console.log(`start drop film episodes.`);

    let ids = fs.readFileSync('./ids.txt', 'utf-8').split('\n');
    console.log(ids);

    for (let id of ids) {
      console.log(id);
      let fpes = await FilmPlistEpisode.remove({ film_plist_id: id });
      console.log('ok', fpes.result.ok);
      console.log('n', fpes.result.n);
      // console.log(fpes);
      // let fpeps = await CFilmPlistPlayCount.remove({ film_plist_id: id });
      // console.log('ok', fpeps.result.ok);
      // console.log('n', fpeps.result.n);
      // console.log(fpeps);
      // process.exit();
      // if (fpeps.result.n !== 0) {
      //   process.exit();
      // }
      // for (let fpe of fpes) {
      //   let fpeps = await FilmPlistEpisodePlay.remove({ film_plist_episode_id: fpe._id });
      //   console.log('ok', fpeps.result.ok);
      //   console.log('n', fpeps.result.n);
      //   if (fpeps.result.n !== 0) {
      //     process.exit();
      //   }
      // }
    }
    console.log(`drop film episodes over.`);
    process.exit();
  } catch (error) {
    console.error(error);
  }
}

drop_episode();