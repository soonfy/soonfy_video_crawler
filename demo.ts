import * as fs from 'fs';

import * as moment from 'moment';
import * as mongoose from 'mongoose';

import * as Crawlers from './index';

import { FilmDetail } from './models/film_detail';

const sleep = async (ss) => {
  return new Promise((resolve) => {
    console.log('sleep -->', ss);
    setTimeout(resolve, ss * 1000);
  })
}

const start = async () => {
  try {
    // fs.writeFileSync('./logs/error.csv', '', 'utf-8');
    // fs.writeFileSync('./logs/play.csv', '', 'utf-8');
    // fs.writeFileSync('./logs/nouri.csv', '', 'utf-8');
    let films = await FilmDetail.find({ isDeleted: { $ne: true }, status: { $gte: 0 }, });
    console.log(films.length);
    let index = 0;
    for (let film of films) {
      console.log('index', ++index);
      let site = film.site,
        name = film.name,
        film_id = film.filmId,
        show_type = film.showType;
      console.log(site);
      console.log(name);
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
          film_id,
          uri,
          site,
          show_type,
          year: name.match(/\s+(\d+)/) ? name.match(/\s+(\d+)/)[1] : ''
        }
        console.log(_film);
        let cfilm = await Crawlers.main(_film);
        // let cfilm = await Crawlers.crawl(_film);
        console.log(cfilm);
        // if (cfilm.cplay) {
        //   fs.appendFileSync('./logs/play.csv', [name, site, uri, cfilm.cplay].join('\t') + '\n', 'utf-8');
        // } else {
        //   fs.appendFileSync('./logs/error.csv', [name, site, uri, cfilm.vids, cfilm.plays].join('\t') + '\n', 'utf-8');
        // }
      } else {
        // fs.appendFileSync('./logs/nouri.csv', [name, site].join('\t') + '\n', 'utf-8');
      }
    }
    console.log('all film over.');
    // await start();
  } catch (error) {
    console.error(error);
  }
}

start();