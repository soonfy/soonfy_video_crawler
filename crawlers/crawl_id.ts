import { crawlIqiyi } from '../parsers/iqiyi';
import { crawlQQ } from '../parsers/qq';

/**
 * 
 * 输入 idatafilm --> _id
 * 输入 site
 * 输入 url
 * 输出 剧集信息
 * 
 */

const crawl = async () => {
  try {
    let film = {
      filmId: '',
      // site: 'iqiyi',
      // uri: 'http://www.iqiyi.com/v_19rrkwmzu0.html',
      // uri: 'http://www.iqiyi.com/v_19rr700mq0.html?src=focustext_1_20130410_1',
      // uri: 'http://www.iqiyi.com/v_19rr76ppv8.html',
      site: 'qq',
      // uri: 'https://v.qq.com/x/cover/yrk9u3rwbp1gmws.html',
      // uri: 'https://v.qq.com/x/cover/dhzimk1qzznf301.html',
      // uri: 'https://v.qq.com/x/cover/m7toji4h8zq5rfy/p0024rld26f.html'
      uri: 'https://v.qq.com/x/cover/4j5vlshrkun0ai8/s0011rixtrb.html'
    }
    console.log(film);
    switch (film.site) {
      case 'iqiyi':
        await crawlIqiyi([film]);
        break;
      case 'qq':
        await crawlQQ([film]);
        break;

      default:
        console.error(`site ${film.site} is error`);
        break;
    }
  } catch (error) {
    console.error(error);
  }
}

crawl();