import * as fs from 'fs';

import * as moment from 'moment';
import * as mongoose from 'mongoose';

/**
 *
 *  配置文件
 *
 */
let Config;
try {
  Config = require('../config.json');
} catch (error) {
  try {
    Config = require('./config.json');
  } catch (error) {
    console.error(`配置文件 config.json 路径没找到`);
    process.exit();
  }
}
console.log(Config);
mongoose.connect(Config && Config.db && Config.db.uris);

import * as Crawlers from './index';

import { FilmDetail } from './models/film_detail';
import { FilmPlist } from './models/film_plist';
import { FilmPlistEpisode } from './models/film_plist_episode';
import { FilmPlistEpisodePlay } from './models/film_plist_episode_playcount';

const sleep = async (ss) => {
  return new Promise((resolve) => {
    console.log('sssssssssss -->', ss);
    setTimeout(resolve, ss * 1000);
  })
}

const start = async () => {
  try {
    fs.writeFileSync('./logs/unde.csv', '', 'utf-8');
    fs.writeFileSync('./logs/error.csv', '', 'utf-8');
    fs.writeFileSync('./logs/play.csv', '', 'utf-8');
    fs.writeFileSync('./logs/nouri.csv', '', 'utf-8');
    let films = await FilmDetail.find({ isDeleted: { $ne: true }, status: { $gte: 0 }, });
    console.log(films.length);
    let index = 0;
    for (let film of films) {
      console.log('index', ++index);
      let site = film.site, name = film.name;
      console.log(site);
      console.log(name);
      let film_id = film.filmId;
      let uri;

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
        // case 'acfun':
        //   uri = film.acfunInfos && film.acfunInfos.acfunuri;
        //   break;

        default:
          break;
      }
      if (uri) {
        let _film = {
          uri,
          site,
          showType: film.showType,
          year: name.match(/\s+(\d+)/) ? name.match(/\s+(\d+)/)[1] : ''
        }
        console.log(_film);
        let resp = await Crawlers.crawl([_film]);
        console.log(resp);
        if (!resp) {
          console.error('返回值是 undefined。');
          fs.appendFileSync('./logs/unde.csv', [name, site, uri].join('\t') + '\n', 'utf-8');
        }
        let {vids, plays} = resp;
        if (!vids || !plays) {
          continue;
        }
        vids = vids.filter(x => x);
        plays = plays.filter(x => x);
        if (vids.length !== plays.length) {
          console.error('id play 数量不一致。');
          fs.appendFileSync('./logs/error.csv', [name, site, uri].join('\t') + '\n', 'utf-8');
          continue;
        }
        let cplay = plays.reduce((a, b) => a + b, 0);
        fs.appendFileSync('./logs/play.csv', [name, site, uri, cplay].join('\t') + '\n', 'utf-8');
        let temp = {
          film_id,
          site,
          uri,
          status: 0,
          created_at: new Date()
        }
        await FilmPlist.remove({ film_id, site });
        let data = await FilmPlist.findOneAndUpdate(temp, { $set: temp }, { upsert: true, new: true });
        await FilmPlistEpisode.remove({ film_plist_id: data._id });
        let date = new Date(moment().format('YYYY-MM-DD'));
        let promises = vids.map(async (vid, i) => {
          let temp = {
            _id: `${site}:${vid}`,
            film_plist_id: data._id,
            crawl_status: 0,
            created_at: new Date(),
            crawled_at: new Date(),
          }
          let play = {
            _id: `${site}:${vid}:${date}`,
            film_plist_episode_id: `${site}:${vid}`,
            date,
            value: plays[i],
            created_at: new Date(),
            is_real: 1
          }
          await FilmPlistEpisodePlay.findOneAndUpdate({ _id: play._id }, { $set: play }, { upsert: true, new: true });
          return await FilmPlistEpisode.findOneAndUpdate({ _id: temp._id }, { $set: temp }, { upsert: true, new: true });
        })
        data = await Promise.all(promises);
        console.log(data);
      } else {
        fs.appendFileSync('./logs/nouri.csv', [name, site].join('\t') + '\n', 'utf-8');
      }
    }
    console.log('all film over.');
  } catch (error) {
    console.error(error);
  }
}

start();