/**
 *
 *  导出采集日期小于今天或者状态错误的剧目
 *
 */

import * as Crawlers from '../index';

import * as filer from 'filer_sf';
import * as path from 'path';
import * as moment from 'moment';

let start = async (file = '', date = new Date()) => {
  try {
    if (!file) {
      file = `../../logs/film-${moment().format('YYYYMMDD')}.xlsx`;
    }
    file = path.join(__dirname, file);
    let resp = await Crawlers.export_film(date);
    console.log(resp.date);
    console.log(resp.films);
    filer.write(file, resp.films);
  } catch (error) {
    console.error(error);
  } finally {
    console.log('需要先在当前目录下创建一个 logs 文件夹。');
    process.exit();
  }
}

start();
