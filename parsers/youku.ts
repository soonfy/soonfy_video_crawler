import * as Epona from 'eponajs';

const epona = Epona.new({ concurrent: 10 });
const reg_list = /http\:\/\/list\.youku\.com\/show\/id\_([\w\d]+)\.html/;
const reg_uri = /(http\:\/\/list\.youku\.com\/show\/id\_[\w\d]+\.html)/;
const reg_play = /(http\:\/\/v\.youku\.com\/v_show\/id\_[\w\d=]+\.html)/;

/**
 *
 *  播放页提取专辑页
 *
 */
epona
  .on(['youku.com/v_show/id_'], {
    // root: ':: html()',
    luri: ".desc-link::href"
  })
  .type('html')
  .then((data) => {
    // console.log(data);
    if (data.luri && !data.luri.startsWith('http')) {
      data.luri = `http:${data.luri}`;
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
  .on(['list.youku.com/show/id_'], {
    // root: ':: html()',
    value: {
      sels: ['.s-body .p-base li *::text()'],
      filters: (texts) => {
        texts = texts.filter(text => {
          return text && text.includes('总播放数');
        })
        if (texts.length !== 1) {
          return null;
        } else {
          let text = texts[0];
          return text.replace(/\D/g, '') - 0;
        }
      }
    },
    episode: {
      sels: ['.p-renew::text()'],
      filters: (text) => {
        let match = text.match(/(\d+)集全/);
        if (match) {
          return match[1] - 0;
        } else {
          match = text.match(/更新至(\d+)集/);
          if (match) {
            return match[1] - 0;
          } else {
            return 0;
          }
        }
      }
    },
    showid: {
      sels: ['script *::text()'],
      filters: (texts) => {
        texts = texts.filter(text => {
          return text && text.includes('PageConfig');
        })
        if (texts.length !== 1) {
          return null;
        } else {
          let text = texts[0];
          let match = text.match(/showid\:\"([\w\d]+)\"/);
          return match ? match[1] : null;
        }
      }
    }
  })
  .type('html')
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
  .on(['list.youku.com/category/show/c_'], {
    // root: ':: html()',
    items: {
      sels: ['.box-series .p-thumb a *'],
      nodes: {
        name: ['::title'],
        uri: ['::href'],
      }
    },
    pages: ['.yk-pages li * ::text()']
  })
  .type('xml')
  .then((data) => {
    if (data.pages) {
      data.max_page = data.pages.slice(-2)[0]
    } else {
      data.max_page = 0
    }
    console.log(data);
    return data;
  })
  .catch((error) => {
    console.error(error);
  })

const crawlYouku = async (films) => {
  try {
    let promises = films.map(async (film) => {
      let vids = [], plays = [];
      let uri = film.uri;
      let match = film.uri && film.uri.match(reg_play);
      if (match) {
        let ldata = await epona.queue(film.uri);
        console.log(ldata);
        if (ldata && ldata.luri) {
          uri = ldata.luri;
        }
      }
      match = uri && uri.match(reg_uri);
      if (match) {
        uri = match[1];
        match = uri && uri.match(reg_list);
        if (match) {
          let pdata = await epona.queue(uri);
          if (pdata.value) {
            vids.push(match[1]);
            plays.push(pdata.value);
          }
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
  '电影': '96',
  '电视剧': '97',
  '综艺': '85',
  '动漫': '100',
}
const searchYouku = async (params) => {
  try {
    let { type, year = 2017 } = params;
    let ntype = name_map[type];
    let page = 1;
    let uri = `http://list.youku.com/category/show/c_${ntype}_r_${year}_s_5_d_1.html`;
    let pdata = await epona.queue(uri);
    let { max_page, items = [] } = pdata
    let videos = [];
    videos = items.map((x, i) => {
      let uri = x.uri;
      uri.startsWith('http') ? '' : uri = `http:${uri}`
      uri = uri.slice(0, uri.indexOf('.html') + 5)
      return {
        name: x.name,
        uri: uri,
        type,
      }
    })
    console.log(max_page);
    while (page < max_page) {
      ++page;
      uri = `http://list.youku.com/category/show/c_${ntype}_r_${year}_s_5_d_1_p_${page}.html`;
      pdata = await epona.queue(uri);
      let { items = [] } = pdata
      videos = videos.concat(items.map((x, i) => {
        let uri = x.uri;
        uri.startsWith('http') ? '' : uri = `http:${uri}`
        uri = uri.slice(0, uri.indexOf('.html') + 5)
        return {
          name: x.name,
          uri: uri,
          type,
        }
      }))
    }
    console.log(videos);
    return videos;
  } catch (error) {
    console.error(error);
  }
}

// (async () => {
//   // let uri = `http://list.youku.com/category/show/c_97_s_1_d_1_r_2017.html`;
//   // uri = 'http://list.youku.com/category/show/c_97_r_2018_pt_3_s_1_d_1.html?spm=a2h1n.8251845.filterPanel.5!6~1~3!4~A'
//   // let pdata = await epona.queue(uri);
//   await searchYouku({ type: '电影' });
// })()

export { crawlYouku, searchYouku }