import * as mongoose from 'mongoose';
import * as moment from 'moment';
import * as rp from 'request-promise';
import * as cheerio from 'cheerio';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as path from 'path';
import * as filer from 'filer_sf';

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
import { Film } from '../models/film';
import { FilmPlist } from '../models/film_plist';

const search_iqiyi = async (name) => {
  try {
    console.log(`start search iqiyi.`);
    name = '那年花开'
    console.log(name);
    let temp = 0;
    let sr = '';
    while (temp < 12) {
      sr += Math.floor(Math.random() * 8 + 1);
      ++temp;
    }
    let option = {
      method: 'get',
      uri: `http://so.iqiyi.com/so/q_${encodeURI(name)}?source=input&sr=${sr}`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
        'Host': 'so.iqiyi.com',
        'Referer': 'http://www.iqiyi.com/',
      }
    }
    let body = await rp(option);
    // console.log(body);
    let $ = cheerio.load(body);
    let div = $('.bottom_right').first();
    let site_name = $(div).parents('.result_info').find('a').first().text().trim();
    let ems = $(div).find('.vm-inline');
    let pre = 'http://so.iqiyi.com/multiEpisode?key=pptv%3A04d18177f39c33d06de54ee447f94f73&platform=web&site=pptv';
    let sites = ems.map((i, x) => {
      let key = $(x).attr('data-doc-id');
      let platform = $(x).attr('data-platform');
      let site = $(x).attr('data-site');
      return { key, platform, site, site_name };
    })
    sites = sites.toArray();
    // console.log(sites);
    let uris = await Promise.all(sites.map(async (x) => {
      let option = {
        method: 'get',
        uri: `http://so.iqiyi.com/multiEpisode?key=${encodeURI(x.key)}&platform=${x.platform}&site=${x.site}`,
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
          'Host': 'so.iqiyi.com',
          'Referer': 'http://www.iqiyi.com/',
        }
      }
      let body = await rp(option);
      body = body.match(/try\{\(([\w\W]*)\)\;\}catch\(e\)\{\}\;/)[1];
      let data = JSON.parse(body).data;
      let $ = cheerio.load(data);
      let uri = $('.album_link').first().attr('href');
      return { name: name, site: x.site, uri: uri, site_name: x.site_name };
    }))

    // console.log(uris);
    return uris;
  } catch (error) {
    console.error(error);
    process.exit();
  }
}

const main = async () => {
  try {
    let uri_file = `../../logs/视频链接刷新结果-${moment().format('YYYYMMDD')}.xlsx`;
    let films = await Film.find({
      status: 1,
      is_deleted: false,
      show_type: {
        $ne: 1
      },
    })
    console.log(films.length);
    let head = [['剧目id', 'ivst剧目名称', '网站类型', '网站剧目名称', 'ivst是否存在', '链接']];
    let index = 0;
    for (let film of films) {
      console.log(++index);
      let uris = await search_iqiyi(film['name']);
      // console.log(uris);
      let data = await Promise.all(uris.map(async (x) => {
        let temp = [];
        if (x['site'] === 'imgo') {
          x['site'] = 'mgtv';
        }
        if (await FilmPlist.findOne({ film_id: film._id, site: x['site'] })) {
          temp = [film['_id'], film['name'], x['site'], x['site_name'], '已存在', x['uri']];
        } else {
          temp = [film['_id'], film['name'], x['site'], x['site_name'], '缺少链接', x['uri']];
        }
        console.log(temp);
        head.push(temp);
      }))
    }
    console.log('all films search over.');
    console.log(head.length);
    uri_file = path.join(__dirname, uri_file);
    filer.write(uri_file, head);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit();
  }
}

// search_iqiyi('猎场');
main();
