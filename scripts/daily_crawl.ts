/**
 *
 *  日常视频采集播放量
 *
 */
import * as moment from 'moment';
import * as mongoose from 'mongoose';
// import * as monitor from 'monitor-node';

import * as Crawlers from '../index';

import { FilmPlist } from '../models/film_plist';
import { Film } from '../models/film';

/**
 *
 *  配置文件
 *  监视数据库
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
// console.log(Config);
// const connection = mongoose.createConnection(Config && Config.db && Config.db.monitor);

const sleep = async (ss) => {
  return new Promise((resolve) => {
    console.log('sleep -->', ss);
    setTimeout(resolve, ss * 1000);
  })
}

const main = async () => {
  try {
    let delay = 1000 * 60 * 30;
    let film = await FilmPlist.findOneAndUpdate({ crawled_status: 1, crawled_at: { $lt: Date.now() - delay } }, { $set: { crawled_at: new Date() } }, { sort: { crawled_at: 1 }, new: true });
    if (!film) {
      film = await FilmPlist.findOneAndUpdate({ crawled_status: 0 }, { $set: { crawled_status: 1, crawled_at: new Date() } }, { sort: { crawled_at: 1 }, new: true });
    }
    let detail = await Film.findById(film.film_id);
    if (!detail) {
      console.error(film);
      console.error(`films no find name.`);
      await FilmPlist.findOneAndUpdate({ _id: film._id }, { $set: { crawled_status: -2 } });
    } else {
      film = film.toObject();
      film.show_type = detail.show_type;
      film.year = detail.year;
      console.log(film);
      // 日常采集不更新 update, 传递第二个参数为 1.
      let cfilm = await Crawlers.main(film, 1);
      if (cfilm && cfilm.cplay) {
        console.log(`采集成功。`);
        await FilmPlist.findOneAndUpdate({ _id: film._id }, { $set: { crawled_status: 0, crawled_at: new Date() } });
      } else {
        console.error(`采集失败。`);
        // await FilmPlist.findOneAndUpdate({ _id: film._id }, { $set: { crawled_status: -1 } });
      }
      cfilm = null;
    }
    film = null;
    detail = null;
    delay = null;
  } catch (error) {
    console.error(error);
  }
}

// main();

const start = async () => {
  try {
    while (true) {
      await main();
      console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
      console.log(`----------------->`);
      console.log(`开始下一次采集。`);
      // let task = await monitor.update(connection);
      // console.log(task);
    }
  } catch (error) {
    console.error(error);
  }
}

start();