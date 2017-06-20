import * as mongoose from 'mongoose';

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
 *  输入 films --> plays
 *  属性 uri, site, showType, year
 * 
 */
const crawl = async (films) => {
  try {
    let promises = films.map(async (film) => {
      // console.log(film);
      let data;
      switch (film.site) {
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
      return data;
    })
    let resp = await Promise.all(promises);
    // console.log(resp);
    return resp[0];
  } catch (error) {
    console.error(error);
  }
}

export {
  crawl
}
