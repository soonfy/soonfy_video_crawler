import * as Epona from 'eponajs';
import * as _ from 'lodash';

const epona = Epona.new({ concurrent: 10 });

/**
 *
 *  专辑页提取 vid, cid
 *
 */
epona
  .on(['v.qq.com/detail'], {
    text: {
      sels: ['#_mod_comments::r-props'],
    },
    episode: {
      sels: ['._playsrc_series .item *'],
      filters: (items) => {
        return items.map(x => x.trim() - 0)
      }
    },
    episode_all: {
      sels: ['._playsrc_series .item_all a::data-range'],
    },
    play: {
      sels: ['._playsrc .btn_primary .icon_text']
    }
  })
  .type('xml')
  .then((data, resp) => {
    // console.log(data);
    let text = data.text.replace(/\'/g, '"').replace(/\;/g, ',').replace(/\s+/g, '').replace(/\,\}/g, '}').replace('id', '"vid"').replace('type', '"cid"').replace('movComSet', '"tmovComSet"');
    // console.log(text);
    let id = JSON.parse(text);
    data.vid = id.vid;
    data.cid = id.cid - 0;
    if (data.episode_all) {
      data.episode_all = data.episode_all.split('-')[1] - 0;
    }
    if (data.episode) {
      data.episode = data.episode.filter(x => x && x - 0).slice(-1)[0];
    }
    if (data.episode || data.episode_all) {
      // pass
    } else if (data.play) {
      data.episode = 1;
    }
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
  .on(['cover'], {
    // root: ':: html()',

    vid: {
      sels: [/columnid\:\s*\"?([\w\d]+)\"?\,/,
        /id\:\s*\"?([\w\d]+)\"?\,/,
        /\"cover\_id\"\:\"([\w\d]+)\"\,/,
        /\"id\"\:\"([\w\d]+)\"\,/],
      // filters: (match) => match && match[1]
      filters: (match) => {
        if (match) {
          return match[1]
        }
      }
    },
    id: {
      sels: [/id\:\s*\"?([\w\d]+)\"?\,/,
        /\"cover\_id\"\:\"([\w\d]+)\"\,/,
        /\"id\"\:\"([\w\d]+)\"\,/],
      // filters: (match) => match && match[1]
      filters: (match) => {
        if (match) {
          return match[1]
        }
      }
    },
    bvid: {
      sels: [/column_id\\":\s*\"?([\w\d]+)\"?\,/,
        /c\_column\_id\:\s*\"?([\w\d]+)\"?\,/,
        /\"column\_id\"\:\"([\w\d]+)\"\,/],
      // filters: (match) => match && match[1]
      filters: (match) => {
        if (match) {
          return match[1]
        }
      }
    },
    cid: {
      sels: [/var\s*VIDEO\_INFO\s*\=\s*\{[\w\W]+?type\"*\s*\:\s*\"*(\d+)/,
        /var\s*COVER\_INFO\s*\=\s*\{[\w\W]+?typeid\"*\s*\:\s*\"*(\d+)/],
      // filters: (match) => match && match[1] - 0
      filters: (match) => {
        if (match) {
          return match[1] - 0
        }
      }
    },
    // episode: {
    //   sels: [/\"current_num\"\:(\d+)\,/],
    //   // filters: (match) => match && match[1] - 0
    //   filters: (match) => {
    //     if (match) {
    //       return match[1] - 0
    //     }
    //   }
    // },

    // cover_info: {
    //   sels: [/var\s*COVER_INFO\s*=\s*(.*)/],
    //   filters: (match) => {
    //     if (match) {
    //       return JSON.parse(match[1])
    //     }
    //   }
    // },
    // column_info: {
    //   sels: [/var\s*COLUMN_INFO\s*=\s*(.*)/],
    //   filters: (match) => {
    //     if (match) {
    //       return JSON.parse(match[1])
    //     }
    //   }
    // },
    // video_info: {
    //   sels: [/var\s*VIDEO_INFO\s*=\s*(.*)/],
    //   filters: (match) => {
    //     if (match) {
    //       return JSON.parse(match[1])
    //     }
    //   }
    // }
  })
  .type('xml')
  .then((data, resp) => {
    // console.log(data);
    // data.vid = data.cover_info.id || data.cover_info.cover_id || data.cover_info.column_id
    // data.cid = data.video_info.type || data.cover_info.typeid || data.column_info.type
    // data.episode = data.cover_info.video_ids.length
    // data.bvid = data.cover_info.column_id || data.column_info.c_column_id || data.column_info.column_id

    data.vid - 0 === 0 ? data.vid = data.id : '';
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
    episode_all: ['video_play_list ::total_episode']
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
    data.value ? data.value = data.value[0] - 0 : 0;
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
  .on(['qq.com/x/list'], {
    // root: ':: html()',
    items: {
      sels: ['.list_item *'],
      nodes: {
        name: ['.figure_title > a ::text()', '.figure_title > a ::title'],
        uri: ['.figure_title > a ::href'],
        img: ['img ::r-lazyload'],
        id: ['::__wind'],
        roles: ['.figure_desc a *'],
        desc: ['.figure_desc ::title', '.figure_desc ::text()'],
        info: ['.figure_info ::text()'],
        score: ['.figure_score ::text()']
      }
    },
    pages: ['._items a *'],
  })
  .type('xml')
  .then((data, resp) => {
    data.items = data.items || []
    data.items.map(x => {
      x.id = x.id && x.id.replace('cid=', '')
      x.roles = x.roles ? x.roles.map(x => x.trim()) : []
      x.score = x.score && x.score.replace(/\s+/g, '')
      x.img = x.img && (!x.img.startsWith('http')) ? 'http:' + x.img.trim() : x.img
    })
    data.max_page = data.pages ? data.pages.slice(-1)[0] : 0
    // console.log(data);
    return data;
  })
  .catch((error) => {
    console.error(error);
  })

const crawlQQ = async (films) => {
  try {
    let promises = films.map(async (film) => {
      let vids = [], plays = [], episode = 0;
      let vdata = await epona.queue(film.uri);
      console.log(vdata);
      if (!vdata.vid) {
        console.error(`视频链接错误，未获取到 vid。`);
        return {
          vids,
          plays,
          episode
        }
      }
      episode = vdata.episode;
      let uri, ldata, pdata, uris, value;
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
        case 23:
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
          if (vdata.bvid) {
            vdata.vid = vdata.bvid;
          }
          uri = `http://s.video.qq.com/loadplaylist?type=6&plname=qq&otype=json&id=${vdata.vid}`;
          ldata = await epona.queue(uri);
          // ldata.ids = [];
          // console.log(ldata);
          // console.log(ldata.ids.length);
          if (film.show_type === 1) {
            uri = `http://s.video.qq.com/loadplaylist?type=4&plname=qq&otype=json&id=${vdata.vid}&year=${film.year}`;
            let _ldata = await epona.queue(uri);
            ldata.ids = _ldata.ids;
          } else {
            if (ldata.years) {
              for (let year of ldata.years) {
                uri = `http://s.video.qq.com/loadplaylist?type=4&plname=qq&otype=json&id=${vdata.vid}&year=${year}`;
                let _ldata = await epona.queue(uri);
                ldata.ids = ldata.ids.concat(_ldata.ids);
              }
            } else {
              ldata.ids = [vdata.vid]
            }
          }
          if (!ldata.ids || ldata.ids.length === 0) {
            break;
          }
          ldata.ids = _.uniq(ldata.ids)
          vids = ldata.ids || [];
          uris = ldata.ids.map(x => `http://data.video.qq.com/fcgi-bin/data?tid=70&appid=10001007&appkey=e075742beb866145&otype=json&idlist=${x}`);
          pdata = await epona.queue(uris);
          // console.log(pdata);
          pdata.map(x => {
            plays.push(x.value);
          })
          episode = plays.length;
          break;

        default:
          console.error(`channel id ${vdata.cid} is error.`);
          break;

      }
      return {
        vids,
        plays,
        episode
      }
    })
    let data = await Promise.all(promises);
    console.log(data);
    return data[0];
  } catch (error) {
    console.error(error);
  }
}

let name_map = {
  '电影': 'movie',
  '电视剧': 'tv',
  '综艺': 'variety',
  '动漫': 'cartoon',
  '纪录片': 'doco',
  '新闻': 'news',
}
const searchQQ = async (params) => {
  try {
    let { type, year = 2017 } = params;
    let ntype = name_map[type];
    let page = 1;
    let uri = `http://v.qq.com/x/list/${ntype}?iyear=${year}&year=${year}&offset=${30 * (page - 1)}&iarea=-1&sort=19`;
    let pdata = await epona.queue(uri);
    let { max_page, items = [] } = pdata
    let videos = items;
    console.log(max_page);
    while (page < max_page) {
      ++page;
      uri = `http://v.qq.com/x/list/${ntype}?iyear=${year}&year=${year}&offset=${30 * (page - 1)}&iarea=-1&sort=19`;
      pdata = await epona.queue(uri);
      let { items = [] } = pdata
      videos = videos.concat(items)
    }
    videos = videos.map(x => {
      x.site = 'qq';
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

(async () => {
  let film = {
    // uri: 'https://v.qq.com/x/cover/xo254buvx49axu6.html',
    uri: 'https://v.qq.com/x/cover/0r16x32f2ncqgiv.html',
    // uri: 'https://v.qq.com/x/cover/cm02hs4nwdr035l.html',
    // uri: 'https://v.qq.com/x/cover/1efvvnobsa3zbcc/g0025r68php.html',
    // uri: 'https://v.qq.com/x/cover/ly2d18qrdchs2mm.html',

    // uri: 'https://v.qq.com/detail/l/ly2d18qrdchs2mm.html',
    // uri: 'https://v.qq.com/detail/0/033i818h6hqga2i.html',
    // uri: 'https://v.qq.com/detail/5/5joh9y90crzqgsj.html',
    // uri: 'https://v.qq.com/detail/7/70584.html',
    // uri: 'https://v.qq.com/detail/1/1efvvnobsa3zbcc.html',
    // uri: 'https://v.qq.com/detail/j/jzhtr2cgy35ejz0.html',
    // uri: 'https://v.qq.com/detail/t/t6udtxyvbhbbxv2.html',
    show_type: -1,
    year: 2017,
  }
  // await crawlQQ([film]);
})()

// 剧目信息api http://node.video.qq.com/x/api/float_vinfo2?cid=qstahun0js2iywx
// (async () => {
//   // let uri = `http://v.qq.com/x/list/tv?iyear=2017&sort=19&iarea=818&offset=0&feature=2`;
//   // let pdata = await epona.queue(uri);
//   await searchQQ({type: '电影'});
// })()

export { crawlQQ, searchQQ }