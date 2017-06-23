import * as mongoose from 'mongoose';
import * as _ from 'lodash';
import * as moment from 'moment';

/**
 *
 *  视频爬虫分流
 *
 */
import { crawlIqiyi } from '../parsers/iqiyi';
import { crawlQQ } from '../parsers/qq';
import { crawlLetv } from '../parsers/letv';
import { crawlSohu } from '../parsers/sohu';
import { crawlYouku } from '../parsers/youku';
import { crawlMgtv } from '../parsers/mgtv';
import { crawlPptv } from '../parsers/pptv';
import { crawlAcfun } from '../parsers/acfun';


/**
 *
 *  数据库操作全在这个文件
 *
 */
import { FilmPlist } from '../models/film_plist';
import { FilmPlistEpisode } from '../models/film_plist_episode';
import { FilmPlistEpisodePlay } from '../models/film_plist_episode_playcount';
import { CFilmPlistPlayCount } from '../models/c_film_plist_playcount';

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
console.log(Config);
mongoose.connect(Config && Config.db && Config.db.uris);

const OFFSET = 86400000;

/**
 *
 *  crawl plays
 *  输入 films --> plays
 *  属性 uri, site, showType, year
 * 
 */
const crawl = async (films) => {
  try {
    if (!Array.isArray(films)) {
      films = [films];
    }
    let promises = films.map(async (film) => {
      // console.log(film);
      let data;
      let {site} = film;
      switch (site) {
        case 'iqiyi':
          data = await crawlIqiyi([film]);
          break;
        case 'qq':
          data = await crawlQQ([film]);
          break;
        case 'letv':
          data = await crawlLetv([film]);
          break;
        case 'sohu':
          data = await crawlSohu([film]);
          break;
        case 'youku':
          data = await crawlYouku([film]);
          break;
        case 'mgtv':
          data = await crawlMgtv([film]);
          break;
        case 'pptv':
          data = await crawlPptv([film]);
          break;
        case 'acfun':
          data = await crawlAcfun([film]);
          break;

        default:
          console.error(`site ${film.site} is error.`);
          process.exit();
          break;
      }
      data = _.assign(film, data);
      return data;
    })
    let resp = await Promise.all(promises);
    // console.log(resp);
    return resp[0];
  } catch (error) {
    console.error(error);
  }
}

/**
 *
 *  plays store and count
 *  输入 plays, action
 *  action: 0 - 人为后台, 更新updated_at 1 - 日常刷播放量, 不更新 updated_at
 *  
 */
const store = async (film_play, action = 0) => {
  try {
    let {film_id, site, uri, vids, plays} = film_play;

    vids = vids.filter(x => x);
    plays = plays.filter(x => x);
    if (vids.length !== plays.length || plays.length === 0) {
      console.error(`vids length != plays length or plays length == 0`);
      console.error(`vids length ${vids.length}`);
      console.error(`plays length ${plays.length}`);
      return;
    }

    // 更新 film plists 表数据
    let detail = await FilmPlist.findOne({ film_id, site, status: 0 });
    let temp = {
      film_id,
      site,
      uri,
      status: 0,
      crawled_at: new Date(),
      crawled_status: 0
    };
    if (action === 0) {
      temp.updated_at = new Date();
    }
    if (!detail) {
      temp.created_at = new Date();
    }
    detail = await FilmPlist.findOneAndUpdate({ film_id, site, status: 0 }, { $set: temp }, {
      upsert: true,
      new: true
    });

    // 更新 film plist episodes 和 film plist episode plays 表数据
    // 先删除原先 vids, 再更新一批
    await FilmPlistEpisode.remove({ film_plist_id: detail._id });
    let promises = vids.map(async (vid, index) => {
      let cal = moment().format('YYYY-MM-DD');
      let date = new Date(cal);
      let _vid = {
        _id: `${detail._id}:${vid}`,
        film_plist_id: detail._id,
      };
      let _play = {
        _id: `${_vid._id}:${cal}`,
        film_plist_episode_id: `${_vid._id}`,
        date,
        value: plays[index],
        created_at: new Date(),
        is_real: 1
      }

      // 可用
      // await FilmPlistEpisode.findOneAndUpdate({ _id: _vid._id }, { $set: _vid }, { upsert: true, new: true });
      // 有去重 vid 的效果
      await FilmPlistEpisode.create(_vid);
      let play = await FilmPlistEpisodePlay.findOneAndUpdate({ _id: _play._id }, { $set: _play }, { upsert: true, new: true });

      // 拟合数据
      let _plays = await FilmPlistEpisodePlay.find({
        film_plist_episode_id: play.film_plist_episode_id,
        is_real: 1
      }).sort({
        date: -1
      }).limit(2);
      if (_plays.length >= 2) {
        let start = _plays[1].date;
        let end = _plays.date;
        if (end - start > OFFSET) {
          console.log(`--> 需要拟合，汇总数据 ${detail._id} ${start} ${end}`);
          // 拟合数据
          await fit(_plays);
          // 汇总数据
          await count(detail._id, start, end);
        }
      }

      return play;
    })
    let data = await Promise.all(promises);

    // 更新 c film plist playcounts 表数据
    let cal = moment().format('YYYY-MM-DD');
    let date = new Date(cal);
    let value = plays.reduce((a, b) => a + b, 0);
    let _cplay = {
      _id: `${detail._id}:${cal}`,
      film_plist_id: `${detail._id}`,
      date,
      value,
      calculated_at: new Date()
    }
    let cplay = await CFilmPlistPlayCount.findOneAndUpdate({ _id: _cplay._id }, { $set: _cplay }, { upsert: true, new: true });
    console.log(`--> 视频播放量存储成功 ${detail._id} ${cal} ${value}`);

    film_play.cplay = cplay.value;
    return film_play;
  } catch (error) {
    console.error(error);
  }
}

/**
 *
 *  count plays
 *  输入 film plists _ids, start date, end date
 *
 */
const count = async (film_ids, start_date, end_date = start_date) => {
  try {
    if (typeof film_ids === 'string') {
      film_ids = [film_ids];
    }
    start_date = new Date(start_date);
    end_date = new Date(end_date);
    // console.log(start_date);
    // console.log(end_date);
    let resp = [];
    let index = 0;
    for (let film_id of film_ids) {
      let temp_date = start_date;
      index++;
      while (temp_date <= end_date) {
        console.log(`--> 汇总数据 ${film_id} ${temp_date}`);
        let vids = await FilmPlistEpisode.find({ film_plist_id: film_id });
        // console.log(vids);
        if (vids.length === 0) {
          continue;
        }
        let _promises = vids.map(async (vid) => {
          return await FilmPlistEpisodePlay.find({ film_plist_episode_id: vid, date: start_date });
        })
        let temp = await Promise.all(_promises);
        if (temp.length === 0) {
          continue;
        }
        let plays = [];
        temp.map(x => Array.prototype.push.apply(plays, x));
        // console.log(plays);

        let value = plays.map(x => x.value).reduce((a, b) => a + b);
        // console.log(value);
        let cal = moment(temp_date).format('YYYY-MM-DD');
        let date = new Date(cal);
        let _id = `${film_ids[index - 1]}:${cal}`;
        let _cplay = {
          _id,
          film_plist_id: film_ids[index - 1],
          date,
          value,
          calculated_at: new Date()
        }
        let cplay = await CFilmPlistPlayCount.findByIdAndUpdate(_id, { $set: _cplay }, { upsert: true, new: true });
        console.log(`--> 数据汇总成功 ${film_id} ${temp_date} ${cplay.value}`);

        cplay = null;
        _cplay = null;
        _id = null;
        cal = null;
        value = null;
        temp = null;
        _promises = null;
        vids = null;

        resp.push(cplay);
        temp_date = new Date(temp_date - 0 + OFFSET);
      }
    }
    console.log(`--> 总共汇总 ${resp.length} 条数据.`);
  } catch (error) {
    console.error(error);
  }
}

/**
 *  
 *  fit plays
 *  输入 film plist episode plays
 *
 */
const fit = async (plays) => {
  try {
    // console.log(plays);
    let film_plist_episode_id = plays[0].film_plist_episode_id,
      start = plays[1].date,
      end = plays[0].date,
      count = Math.floor((end - start) / OFFSET),
      diff = plays[0].value - plays[1].value,
      inc = Math.floor(diff / count),
      index = 1;
    console.log(`--> ${film_plist_episode_id} 缺失 ${count - 1} 天数据.`);
    while (index < count) {
      let cal = moment(end - OFFSET * index).format('YYYY-MM-DD');
      let date = new Date(cal);
      let value = plays[0].value - inc * index
      let _play = {
        _id: `${film_plist_episode_id}:${cal}`,
        film_plist_episode_id,
        date,
        value,
        created_at: new Date(),
        is_real: 0
      }
      let resp = await FilmPlistEpisodePlay.findByIdAndUpdate(_play._id, {
        $set: _play
      }, {
          upsert: true,
          new: true
        })
      console.log(`--> 第 ${index} 次拟合成功`, resp._id, resp.value);
      index++;
    }
    console.log(`--> 数据全部拟合成功 ${film_plist_episode_id} ${start} ${end}`);
  } catch (error) {
    console.error(error);
  }
}

/**
 *
 *  font interface
 *  输入 film, action
 *  action: 0 - 人为后台, 更新updated_at; 1 - 日常刷播放量, 不更新 updated_at
 *  film id, site, uri, showType, year
 *
 */
const main = async (film, action = 0) => {
  try {
    let resp = await crawl([film]);
    if (!resp) {
      return film;
    }
    let {vids, plays} = resp;
    if (!resp.vids || !resp.plays) {
      console.log(resp);
      return film;
    }
    vids = vids.filter(x => x);
    plays = plays.filter(x => x);
    if (vids.length === plays.length && plays.length > 0) {
      let cfilm = await store(resp, action);
      return cfilm;
    } else {
      console.error(`--> vids length != plays length or plays length == 0`);
      return film;
    }
  } catch (error) {
    console.error(error);
    return film;
  }
}

/**
 *
 *  search vids, plays
 *
 */
const search = async (days = 30) => {
  try {
    let plays = [],
      date = moment().format('YYYY-MM-DD'),
      temp = moment().format('YYYY-MM-DD'),
      start = moment().startOf('day');
    let index = 0;
    let films = await FilmPlist.count({ crawled_status: 0, crawled_at: { $gte: start } });
    let vids = await FilmPlistEpisode.count({});
    // console.log(films);
    // console.log(vids);
    while (index < days) {
      ++index;
      temp = new Date(temp);
      let cal = moment(temp).format('YYYY-MM-DD');
      // console.log(temp);
      let eplays = await FilmPlistEpisodePlay.count({ date: temp });
      let cplays = await CFilmPlistPlayCount.count({ date: temp });
      // console.log(eplays);
      // console.log(cplays);
      plays.push([cal, cplays, eplays]);
      temp = temp.valueOf() - OFFSET;
    }
    return {
      date,
      films,
      vids,
      plays
    }
  } catch (error) {
    console.error(error);
  }
}

export {
  crawl,
  store,
  count,
  fit,
  main,
  search
}
