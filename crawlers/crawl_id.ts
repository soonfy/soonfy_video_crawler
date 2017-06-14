import {IqiyiParser} from '../parsers/iqiyi';

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
      site: '',
      uri: ''
    }
    console.log(film);
    let uri = 'http://www.iqiyi.com/v_19rrkwmzu0.html';
    let data = await IqiyiParser.queue(uri);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

crawl();