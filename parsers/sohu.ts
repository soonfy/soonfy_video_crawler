import * as Epona from 'eponajs';
import * as fs from 'fs';

const epona = Epona.new({ concurrent: 10 });
const reg_vid = /www\.let?v?\.com\/\w+\/([\w\d]+)\.html/;

/**
 *
 *  播放页提取 vid, cid
 *
 */
epona
  .on(['tv.sohu.com/20'], {
    vid: {
      sels: [/var\s*playlistId\s*\=\s*\"*(\d+)/],

      filters: (match) => match[1] - 0 + ''
    },
    cid: {
      sels: [/var\s*cid\s*\=\s*\"*(\d+)/],
      filters: (match) => match[1] - 0
    }
  })
  .type('html')
  .then((data, resp) => {
    // console.log(data);
    return data;
  })
  .catch((error) => {
    console.error(error);
  })

/**
 *
 *  会员电影播放页提取 vid, cid
 *
 */
epona
  .on(['film.sohu.com'], {
    vid: {
      sels: ['#vid::value', '#tvid::value'],
      filters: (text) => text.length > 0 && text.split(/\s*\,/)[0]
    }
  })
  .type('html')
  .then((data, resp) => {
    // console.log(data);
    data.cid = 0;
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
  .on(['count.vrs.sohu.com'], {
    // root: ':: html()',
    value: {
      sels: ['plids > *::total', 'vids > *::total'],
    }
  })
  .beforeParse(body => body.replace('plids', '"plids"').replace('vids', '"vids"'))
  .type('xml')
  .then((data) => {
    // console.log(data);
    if (data.value.length === 1) {
      data.value = data.value[0] - 0;
    } else {
      data.value = 0;
    }
    return data;
  })
  .catch((error) => {
    console.error(error);
  })

/**
 *
 *  综艺提取 years, ids
 *
 */
epona
  .on(['pl.hd.sohu.com'], {
    // root: ':: html()',
    date: {
      sels: ['months > *'],
      nodes: {
        year: ['::tag()'],
        month: ['::text()']
      }
    },
    items: {
      sels: ['videos *'],
      nodes: {
        date: ['::showDate'],
        id: ['::vid']
      }
    }
  })
  .type('xml')
  .then((data) => {
    // console.log(data);
    return data;
  })
  .catch((error) => {
    console.error(error);
  })

const crawlSohu = async (films) => {
  try {
    let promises = films.map(async (film) => {
      let vdata = await epona.queue(film.uri);
      // console.log(vdata);
      if (!vdata.vid) {
        return;
      }
      let uri, ldata, pdata;
      let vids = [], plays = [];
      switch (vdata.cid) {
        // 单个 id
        case 0:
          // 会员电影
          uri = `http://count.vrs.sohu.com/count/queryext.action?vids=${vdata.vid}`;
          pdata = await epona.queue(uri);
          // console.log(pdata);
          if (pdata.value) {
            vids.push(vdata.vid);
            plays.push(pdata.value);
          }
          break;
        case 1:
        // 电影
        case 2:
        // 电视剧
        case 16:
          // 动漫
          uri = `http://count.vrs.sohu.com/count/queryext.action?plids=${vdata.vid}`;
          pdata = await epona.queue(uri);
          // console.log(pdata);
          if (pdata.value) {
            vids.push(vdata.vid);
            plays.push(pdata.value);
          }
          break;

        // 多个ids
        case 7:
        // 综艺
        case 8:
          // 纪录片
          if (film.showType === 1) {
            uri = `http://pl.hd.sohu.com/videolist?playlistid=${vdata.vid}&order=1`;
            ldata = await epona.queue(uri);
            // console.log(ldata);
            let items = ldata.items.filter(x => {
              return x.date && x.date.startsWith(film.year);
            })
            let uris = items.map(x => {
              vids.push(x.id);
              return `http://count.vrs.sohu.com/count/queryext.action?vids=${x.id}`;
            })
            pdata = await epona.queue(uris);
            // console.log(pdata);
            pdata.map(x => {
              plays.push(x.value);
            })
          } else {
            uri = `http://count.vrs.sohu.com/count/queryext.action?plids=${vdata.vid}`;
            pdata = await epona.queue(uri);
            // console.log(pdata);
            if (pdata.value) {
              vids.push(vdata.vid);
              plays.push(pdata.value);
            }
          }
          break;

        default:
          console.error(`channel id ${vdata.cid} is error.`);
          fs.appendFileSync('./logs/sohu.ts.log', [film.uri, vdata.cid].join('\t') + '\n', 'utf-8');
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

export { crawlSohu }