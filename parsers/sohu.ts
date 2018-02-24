import * as Epona from 'eponajs';

const epona = Epona.new({ concurrent: 10 });
const reg_vid = /www\.let?v?\.com\/\w+\/([\w\d]+)\.html/;

/**
 *
 *  专辑页提取 vid, cid
 *
 */
epona
  .on(['tv.sohu.com/s'], {
    vid: {
      sels: [/var\s*playlistId\s*\=\s*\"*(\d+)/],

      filters: (match) => match[1] - 0 + ''
    },
  })
  .type('html')
  .then((data, resp) => {
    // console.log(data);
    // 专辑页 都走综艺
    data.cid = 7;
    return data;
  })
  .catch((error) => {
    console.error(error);
  })

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
  // .beforeParse(body => body.replace('plids', '"plids"').replace('vids', '"vids"'))
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

/**
* 
* 提取剧目列表
* 
*/
epona
  .on(['so.tv.sohu.com/list_'], {
    // root: ':: html()',
    items: {
      sels: ['.st-list li *'],
      nodes: {
        name: ['strong a ::title', 'strong a ::text()'],
        uri: ['strong a ::href'],
        img: ['img ::src'],
        info: ['.maskTx'],
        roles: ['.actor a *'],
      }
    },
    pages: {
      sels: ['.ssPages a *'],
      nodes: {
        page: ['::title', '::text()'],
        uri: ['::href'],
      }
    }
  })
  .type('xml')
  .then((data) => {
    data.items = data.items || []
    data.items.map(x => {
      x.uri.startsWith('http') ? '' : x.uri = `https:${x.uri}`
      x.img.startsWith('http') ? '' : x.img = `https:${x.img}`
    })
    // console.log(data);
    return data;
  })
  .catch((error) => {
    console.error(error);
  })

const crawlSohu = async (films) => {
  try {
    let promises = films.map(async (film) => {
      let vids = [], plays = [];
      let vdata = await epona.queue(film.uri);
      console.log(vdata);
      if (!vdata.vid) {
        console.error(`视频链接错误，未获取到 vid。`);
        return {
          vids,
          plays
        }
      }
      let uri, ldata, pdata;
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
          if (film.show_type === 1) {
            uri = `http://pl.hd.sohu.com/videolist?playlistid=${vdata.vid}&order=1`;
            ldata = await epona.queue(uri);
            // console.log(ldata);
            if (!ldata.items || ldata.items.length === 0) {
              break;
            }
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
  '电影': '100',
  '电视剧': '101',
  '综艺': '106',
  '动漫': '115',
  '纪录片': '107',
  '新闻': '122',
}
const searchSohu = async (params) => {
  try {
    let { type, year = 2017 } = params;
    let ntype = name_map[type];
    let page = 1, max_page;
    let uri = `https://so.tv.sohu.com/list_p1${ntype}_p2_p3_p4${year}_p5_p6_p73_p8_p9_p10_p11_p12_p131.html`;
    let pdata = await epona.queue(uri);
    let { pages, items = [] } = pdata
    let videos = items;
    if (pages) {
      pages.map(x => {
        if (x.page - 0) {
          max_page = x.page - 0
        }
      })
    }
    while (page < max_page) {
      ++page;
      let next = `https://so.tv.sohu.com/list_p1${ntype}_p2_p3_p4${year}_p5_p6_p73_p8_p9_p10${page}_p11_p12_p131.html`
      pdata = await epona.queue(next);
      let { items = [] } = pdata
      videos = videos.concat(items)
    }
    console.log(videos);
    videos = videos.map(x => {
      x.site = 'sohu';
      x.type = type;
      x.year = year;
      return x;
    })
    // console.log(videos);
    return videos;
  } catch (error) {
    console.error(error);
  }
}

// (async () => {
//   // let uri = `https://so.tv.sohu.com/list_p1101_p2_p3_p42017_p5_p6_p73_p8_p9_p10_p11_p12_p13.html`;
//   // let pdata = await epona.queue(uri);
//   await searchSohu({ type: '电影' })
// })()

export { crawlSohu, searchSohu }
