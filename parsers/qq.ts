import * as Epona from 'eponajs';
import * as fs from 'fs';

const epona = Epona.new({ concurrent: 10 });

/**
 *
 *  播放页提取 vid, cid
 *
 */
epona
  .on(['cover'], {
    vid: {
      sels: [/columnid\:\s*\"?([\w\d]+)\"?\,/],
      filters: (match) => match[1]
    },
    id: {
      sels: [/id\:\s*\"?([\w\d]+)\"?\,/, /\"cover\_id\"\:\"([\w\d]+)\"\,/],
      filters: (match) => match[1]
    },
    cid: {
      sels: [/var\s*VIDEO\_INFO\s*\=\s*\{[\w\W]+?type\"*\s*\:\s*\"*(\d+)/, /var\s*COVER\_INFO\s*\=\s*\{[\w\W]+?typeid\"*\s*\:\s*\"*(\d+)/,],
      filters: (match) => match[1] - 0
    }
  })
  .type('xml')
  .then((data, resp) => {
    data.vid - 0 === 0 ? data.vid = data.id : '';
    // console.log(data);
    return data;
  })
  .catch((error) => {
    console.error(error);
  })

/**
 *
 *  提取 ids
 *
 */
epona
  .on(['loadplaylist'], {
    // root: ':: html()',
    ids: ['playlist *::id'],
    years: ['year *::text()'],
    total: ['video_play_list ::total_episode']
  })
  .beforeParse(body => body.match(/QZOutputJson\=([\w\W]*)\;/)[1])
  .type('xml')
  .then((data, resp) => {
    // console.log(data);
    return data;
  })
  .catch((error) => {
    console.error(error);
  })

/**
 *
 *  提取 play
 *
 */
epona
  .on(['data.video.qq.com'], {
    // root: ':: html()',
    value: ['results > *::allnumc'],
  })
  .beforeParse(body => body.match(/QZOutputJson\=([\w\W]*)\;/)[1])
  .type('xml')
  .then((data, resp) => {
    data.value ? data.value = data.value[0] - 0 : '';
    // console.log(data);
    return data;
  })
  .catch((error) => {
    console.error(error);
  })

const crawlQQ = async (films) => {
  try {
    let promises = films.map(async (film) => {
      let vdata = await epona.queue(film.uri);
      console.log(vdata);
      let uri, ldata, pdata, uris, value;
      let vids = [], plays = [];
      switch (vdata.cid) {
        // 单个 id
        case 1:
        // 电影
        case 2:
        // 电视剧
        case 3:
        // 动漫
        case 6:
        // 游戏
        case 9:
        // 纪录片
        case 26:
        // 旅游
        case 106:
          // 少儿
          uri = `http://data.video.qq.com/fcgi-bin/data?tid=70&appid=10001007&appkey=e075742beb866145&otype=json&idlist=${vdata.vid}`;
          pdata = await epona.queue(uri);
          // console.log(pdata);
          if (pdata.value) {
            vids.push(vdata.vid);
            plays.push(pdata.value);
          }
          break;

        // 多个ids
        case 5:
        // 娱乐
        case 10:
        // 综艺
        case 22:
        // 音乐
        case 24:
        // 综艺
        case 25:
        // 时尚
        case 31:
        // 生活
        case 60:
          // 母婴
          uri = `http://s.video.qq.com/loadplaylist?type=6&plname=qq&otype=json&id=${vdata.vid}`;
          ldata = await epona.queue(uri);
          ldata.ids = [];
          console.log(ldata);
          // console.log(ldata.ids.length);
          if (film.showType === 1) {
            uri = `http://s.video.qq.com/loadplaylist?type=4&plname=qq&otype=json&id=${vdata.vid}&year=${film.year}`;
            let _ldata = await epona.queue(uri);
            ldata.ids = _ldata.ids;
          } else {
            for (let year of ldata.years) {
              uri = `http://s.video.qq.com/loadplaylist?type=4&plname=qq&otype=json&id=${vdata.vid}&year=${year}`;
              let _ldata = await epona.queue(uri);
              ldata.ids = ldata.ids.concat(_ldata.ids);
            }
          }
          vids = ldata.ids;
          uris = ldata.ids.map(x => `http://data.video.qq.com/fcgi-bin/data?tid=70&appid=10001007&appkey=e075742beb866145&otype=json&idlist=${x}`);
          pdata = await epona.queue(uris);
          // console.log(pdata);
          pdata.map(x => {
            plays.push(x.value);
          })
          break;

        default:
          console.error(`channel id ${vdata.cid} is error.`);
          fs.appendFileSync('./logs/qq.ts.log', [film.uri, vdata.cid].join('\t') + '\n', 'utf-8');
          break;

      }
      return {
        vids,
        plays
      }
    })
    let data = await Promise.all(promises);
    return data[0];
  } catch (error) {
    console.error(error);
  }
}

export { crawlQQ }