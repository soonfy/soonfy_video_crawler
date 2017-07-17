/**
 *
 *  导出剧目, 剧集vid, 每天采集播放量数据
 *
 */

import * as Crawlers from '../index';

import * as filer from 'filer_sf';
import * as path from 'path';
import * as moment from 'moment';

let start = async (days = 30, file = '') => {
  try {
    if (!file) {
      file = `../../logs/log-${moment().format('YYYYMMDD')}.xlsx`;
    }
    file = path.join(__dirname, file);
    let resp = await Crawlers.search(days);
    let data = [];
    data.push(['日期', '可以采集剧目films数量', '解析出的vids数量']);
    data.push([resp.date, resp.films, resp.vids]);
    data.push(['日期', '采集到的剧目播放fplays数量', '采集到的单集播放eplays数量']);
    Array.prototype.push.apply(data, resp.plays);
    console.log(data);
    filer.write(file, data);
  } catch (error) {
    console.error(error);
  } finally {
    console.log('需要先在当前目录下创建一个 logs 文件夹。');
    process.exit();
  }
}

start(200);
