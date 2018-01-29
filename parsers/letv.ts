import * as Epona from 'eponajs';

const epona = Epona.new({ concurrent: 10 });

const reg_list = /www\.let?v?\.com\/\w+\/([\w\d]+).html/;

/**
 *
 *  播放页提取 vid, cid
 *
 */
epona
  .on(['le.com/ptv', 'letv.com/ptv'], {
    uri: ['.Info .more::href'],
    vid: {
      sels: [/var\s*\_\_INFO\_\_\s*\=\s*\{[\w\W]+?pid\"*\s*\:\s*\"*(\d+)/],
      filters: (match) => match[1] - 0 + ''
    },
    cid: {
      sels: [/var\s*\_\_INFO\_\_\s*\=\s*\{[\w\W]+?cid\"*\s*\:\s*\"*(\d+)/],
      filters: (match) => match[1] - 0
    }
  })
  .type('html')
  .then((data, resp) => {
    // console.log(data);
    let uri = data.uri;
    if (!data.vid && uri) {
      const reg_vid = /www\.let?v?\.com\/\w+\/([\w\d]+)\.html/;
      let match = uri.match(reg_vid);
      if (match) {
        data.vid = match[1];
      }
    }
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
  .on(['v.stat.letv.com'], {
    // root: ':: html()',
    value: ['plist_play_count | numbers', 'media_play_count | numbers'],
  })
  .type('xml')
  .then((data) => {
    data.value = data.value - 0
    // console.log(data);
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
  .on(['d.api.m.le.com'], {
    // root: ':: html()',
    years: ['years *'],
    year: ['data ::currentYear'],
    ids: ['list *::vid']
  })
  .type('xml')
  .then((data) => {
    // console.log(data);
    return data;
  })
  .catch((error) => {
    console.error(error);
  })

/**
* 
* 提取剧目列表
* 
*/
epona
  .on(['list.le.com/listn/c'], {
    // root: ':: html()',
    items: {
      sels: ['.dl_list .p_t a *'],
      nodes: {
        name: ['::title', '::text()'],
        uri: ['::href'],
      }
    },
    next: ['.noPage ::text()']
  })
  .type('xml')
  .then((data) => {
    console.log(data);
    return data;
  })
  .catch((error) => {
    console.error(error);
  })

/**
* 
* 提取剧目列表 json
* 
*/
epona
  .on(['list.le.com/apin/chandata.json'], {
    // root: ':: html()',
    items: {
      sels: ['album_list *'],
      nodes: {
        name: ['::name'],
        vids: ['::vids'],
        pid: ['::aid']
      }
    },
    count: ['album_count | numbers']
  })
  .type('xml')
  .then((data) => {
    // console.log(data);
    return data;
  })
  .catch((error) => {
    console.error(error);
  })

const crawlLetv = async (films) => {
  try {
    let promises = films.map(async (film) => {
      let vids = [], plays = [];

      let vdata = {
        vid: null,
        cid: null,
      };
      // 专辑页 都走综艺
      let match = film.uri.match(reg_list);
      if (match) {
        vdata.vid = match[1];
        vdata.cid = 11;
        console.log(vdata);
      } else {
        vdata = await epona.queue(film.uri);
        console.log(vdata);
        if (!vdata || !vdata.vid) {
          console.error(`视频链接错误，未获取到 vid。`);
          return {
            vids,
            plays
          }
        }
      }
      let uri, ldata, pdata;
      switch (vdata.cid) {
        // 单个 id
        case 1:
        // 电影
        case 2:
        // 电视剧
        case 5:
          // 动漫
          uri = `http://v.stat.letv.com/vplay/queryMmsTotalPCount?pid=${vdata.vid}`;
          pdata = await epona.queue(uri);
          // console.log(pdata);
          if (pdata.value) {
            vids.push(vdata.vid);
            plays.push(pdata.value);
          }
          break;

        // 多个 ids
        case 11:
        // 综艺
        case 16:
          // 纪录片
          if (film.show_type === 1) {
            // uri = `http://d.api.m.le.com/detail/getPeriod?pid=${vdata.vid}&platform=pc&_=${Date.now()}`;
            // ldata = await epona.queue(uri);
            // console.log(ldata);
            uri = `http://d.api.m.le.com/detail/getPeriod?pid=${vdata.vid}&year=${film.year}&platform=pc`;
            ldata = await epona.queue(uri);
            if (!ldata.ids || ldata.ids.length === 0) {
              break;
            }
            let uris = ldata.ids.map(x => {
              vids.push(x);
              return `http://v.stat.letv.com/vplay/queryMmsTotalPCount?vid=${x}`;
            })
            pdata = await epona.queue(uris);
            // console.log(pdata);
            pdata.map(x => {
              plays.push(x.value);
            })
          } else {
            // uri = `http://d.api.m.le.com/detail/getPeriod?pid=${vdata.vid}&platform=pc&_=${Date.now()}`;
            // ldata = await epona.queue(uri);
            // console.log(ldata);
            uri = `http://v.stat.letv.com/vplay/queryMmsTotalPCount?pid=${vdata.vid}`;
            pdata = await epona.queue(uri);
            // console.log(pdata);
            vids.push(vdata.vid);
            plays.push(pdata.value);
          }
          break;

        default:
          console.error(`channel id ${vdata.cid} is error.`);
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

let name_map = {
  '电影': '1',
  '电视剧': '2',
  '综艺': '11',
  '动漫': '5',
  '纪录片': '16',
}
const searchLetv = async (params) => {
  try {
    let { type, year = 2017 } = params;
    let ntype = name_map[type];
    let page = 1;
    let uri = `http://list.le.com/apin/chandata.json?c=${ntype}&d=1&md=&o=9&p=${page}&s=1&y=${year}`;
    let pdata = await epona.queue(uri);
    let { count, items = [] } = pdata;
    console.log(count);
    let videos = items;
    while (page * 30 < count) {
      ++page;
      uri = `http://list.le.com/apin/chandata.json?c=${ntype}&d=1&md=&o=9&p=${page}&s=1&y=${year}`;
      pdata = await epona.queue(uri);
      let { items = [] } = pdata
      videos = videos.concat(items)
    }
    // console.log(videos);
    return videos;
  } catch (error) {
    console.error(error);
  }
}

// (async () => {
//   // let uri = `http://list.le.com/apin/chandata.json?c=1&d=1&md=&o=4&p=1&s=1&y=2017`;
//   // let pdata = await epona.queue(uri);
//   await searchLetv({ type: '电视剧' })
// })()

export { crawlLetv, searchLetv }