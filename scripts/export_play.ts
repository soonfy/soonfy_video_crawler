/**
 *
 *  导出播放量有减小情况的剧目播放数据
 *
 */

import * as Crawlers from '../index';

import * as filer from 'filer_sf';
import * as path from 'path';
import * as moment from 'moment';

let start = async (file = '', days = 30) => {
  try {
    if (!file) {
      file = `../../logs/play-${moment().format('YYYYMMDD')}.xlsx`;
    }
    file = path.join(__dirname, file);
    let resp = await Crawlers.export_play(days);
    console.log(resp.date);
    console.log(resp.plays);
    filer.write(file, resp.plays);
  } catch (error) {
    console.error(error);
  } finally {
    console.log('需要先在当前目录下创建一个 logs 文件夹。');
    process.exit();
  }
}

start();
