import * as Epona from 'eponajs';

const epona = Epona.new({ concurrent: 10 });
const reg_list = /^http\:\/\/www\.mgtv\.com\/\w+\/(\w+)\.html/;
const reg_play = /^http\:\/\/www\.mgtv\.com\/\w+\/(\w+)\/\w+\.html/;

/**
 *
 *  提取 play
 *
 */
epona
  .on(['vc.mgtv.com'], {
    // root: ':: html()',
    value: {
      sels: ['data::all'],
      filters: 'numbers'
    }
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
 *  提取剧目列表
 *
 */
epona
  .on(['list.mgtv.com'], {
    // root: ':: html()',
    items: {
      sels: ['.m-result-list-item .u-title *'],
      nodes: {
        name: ['::text()'],
        uri: ['::href'],
        info: ['::onclick'],
      }
    },
    next: ['.next ::href'],
    pages: {
      sels: ['.w-pages a *'],
      nodes: {
        name: ['::text()'],
        uri: ['::href'],
      }
    }
  })
  .type('xml')
  .then((data) => {
    data.items = data.items.map((x, i) => {
      let uri = x.uri;
      uri.startsWith('http') ? '' : uri = `https:${uri}`
      uri = uri.slice(0, uri.indexOf('.html') + 5)
      return {
        name: x.name,
        uri: uri,
        info: x.info,
      }
    })
    if (data.next) {
      data.next.startsWith('http') ? '' : data.next = `https://list.mgtv.com${data.next}`
    }
    // console.log(data);
    return data;
  })
  .catch((error) => {
    console.error(error);
  })

const crawlMgtv = async (films) => {
  try {
    let promises = films.map(async (film) => {
      let vids = [], plays = [];
      let match = film.uri && film.uri.match(reg_list) || film.uri.match(reg_play);
      if (match) {
        let uri = `http://vc.mgtv.com/v2/dynamicinfo?cid=${match[1]}`;
        let pdata = await epona.queue(uri);
        if (pdata.value) {
          vids.push(match[1]);
          plays.push(pdata.value);
        }
      } else {
        console.error(`视频链接错误，未获取到 vid。`);
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
  '电影': '3',
  '电视剧': '2',
  '综艺': '1',
  '动漫': '50',
  '纪录片': '51',
  '新闻': '106',
}
const searchMgtv = async (params) => {
  try {
    let { type, year = 2017 } = params;
    let ntype = name_map[type];
    let page = 1;
    let uri = `https://list.mgtv.com/-------------.html?channelId=${ntype}`;
    let pdata = await epona.queue(uri);
    let { next = '', items = [] } = pdata
    let videos = items;
    while (next) {
      pdata = await epona.queue(next);
      let { items = [] } = pdata
      videos = videos.concat(items)
      next = pdata.next || ''
    }
    videos = videos.map(x => {
      x.site = 'mgtv';
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
//   // let uri = `http://list.iqiyi.com/www/2/17----------0-2017--4-1-1---.html`;
//   // let pdata = await epona.queue(uri);
//   await searchMgtv({ type: '电视剧' })
// })()

export { crawlMgtv, searchMgtv }
