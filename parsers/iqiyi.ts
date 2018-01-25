import * as Epona from 'eponajs';

const epona = Epona.new({ concurrent: 10 });

/**
 *
 *  专辑页提取 vid, cid
 *
 */
epona
  .on(['iqiyi.com/a_'], {
    vid: ['#widget-playcount::data-playcount-albumid',
      '.album-fun-fav::data-subscribe-albumid'],
    cid: {
      sels: /cid\s*:\s*(\d+)\,/,
      filters: (match) => match[1] - 0
    },
    ids_back: {
      sels: ['.juji-list > *'],
      nodes: {
        vid: ['::data-albumid'],
        cid: ['::data-cid']
      }
    }
  })
  .type('xml')
  .then((data, resp) => {
    // console.log(data);
    if (!data.vid && !data.cid && data.ids_back.length > 0) {
      // 当时的热门综艺
      data.vid = data.ids_back[0].vid;
      data.cid = data.ids_back[0].cid - 0;
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
  .on(['iqiyi.com/v_', 'iqiyi.com/dianshiju', 'iqiyi.com/zongyi', 'vip.iqiyi.com', 'iqiyi.com/dianying', 'iqiyi.com/dongman'], {
    // root: ':: html()',
    vid: ['#videoShopGuideWrap::data-shop-albumid',
      '#widget-qiyu-zebra::data-qiyu-albumid',
      '#playerAreaScore::data-score-tvid',
      '#videoArea::data-player-tvid',
      '#flashbox::data-player-tvid',
    ],
    cid: {
      sels: /cid\s*:\s*(\d+)\,/,
      filters: (match) => match[1] - 0
    },
    metas: {
      sels: ['meta *'],
      nodes: {
        equiv: ['::http-equiv'],
        content: ['::content']
      }
    }
  })
  .type('xml')
  .then(async (data, resp) => {
    // console.log(data);
    if (!data.vid && resp.url.includes('vip.iqiyi.com')) {
      let uri;
      data.metas.map(meta => {
        if (meta.equiv === 'refresh') {
          uri = meta.content.match(/(http.+html)/)[1]
        }
      })
      if (uri) {
        data = await epona.queue(uri);
        delete data.metas;
        return data;
      }
    }
    delete data.metas;
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
  .on(['mixer.video.iqiyi.com'], {
    value: ['playCount | numbers'],
  })
  .beforeParse(body => body.match(/var\s*tvInfoJs\=([\w\W]*)/)[1])
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
 *  电视剧提取 ids
 *
 */
epona
  .on(['cache.video.iqiyi.com/jp/avlist/'], {
    // root: ':: html()',
    ids: ['vlist *::tvQipuId'],
    episode: ['data::pt']
  })
  .beforeParse(body => body.match(/var\s*tvInfoJs\=([\w\W]*)/)[1])
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
 *  综艺提取 years
 *
 */
epona
  .on(['cache.video.iqiyi.com/jp/sdlst/'], {
    // root: ':: html()'
    years: {
      sels: 'data > *::tag()',
      filters: 'uniq'
    },
  })
  .beforeParse(body => body.match(/var\s*tvInfoJs\=([\w\W]*)/)[1])
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
 *  综艺提取 ids
 *
 */
epona
  .on(['cache.video.qiyi.com/jp/sdvlst/'], {
    // root: ':: html()',
    ids: {
      sels: 'data *::tvQipuId',
      filters: 'uniq'
    },
  })
  .beforeParse(body => body.match(/var\s*tvInfoJs\=([\w\W]*)/)[1])
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
  .on(['list.iqiyi.com'], {
    // root: ':: html()',
    items: {
      sels: ['.site-piclist_pic_link *'],
      nodes: {
        name: ['::title', '::alt'],
        uri: ['::href'],
        id: ['::data-qipuid'],
        info: ['::data-searchpingback-param']
      }
    },
    next: ['.noPage ::text()']
  })
  .type('xml')
  .then((data) => {
    data.items = data.items || []
    data.items.map(x => {
      x.target = x.info.match(/target=([^&]+)&/)[1]
      x.site = x.info.match(/site=([^&]+)&/)[1]
    })
    return data;
  })
  .catch((error) => {
    console.error(error);
  })

const crawlIqiyi = async (films) => {
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
          episode,
        }
      }
      let cid = vdata.cid;
      let uri, ldata, pdata;
      switch (cid) {
        // 单个id
        case 1:
        // 电影
        case 16:
          // 微电影
          uri = `http://mixer.video.iqiyi.com/jp/mixin/videos/${vdata.vid}/`;
          pdata = await epona.queue(uri);
          // console.log(pdata);
          if (pdata.value) {
            vids.push(vdata.vid);
            plays.push(pdata.value);
          } else {
            // 部分电影汇总 --> 爱奇艺爱电影
            let uris;
            if (film.show_type === 1) {
              uris = [`http://cache.video.qiyi.com/jp/sdvlst/${vdata.cid}/${vdata.vid}/${film.year}/`];
            } else {
              uri = `http://cache.video.iqiyi.com/jp/sdlst/${vdata.cid}/${vdata.vid}/`;
              ldata = await epona.queue(uri);
              // console.log(ldata);
              uris = ldata.years.map(year => `http://cache.video.qiyi.com/jp/sdvlst/${vdata.cid}/${vdata.vid}/${year}/`);
            }
            ldata = await epona.queue(uris);
            // console.log(ldata);
            ldata.map(_data => {
              Array.prototype.push.apply(vids, _data.ids);
            })
            // console.log(vids);
            uris = vids.map(vid => `http://mixer.video.iqiyi.com/jp/mixin/videos/${vid}/`);
            // console.log(uris);
            pdata = await epona.queue(uris);
            // console.log(pdata);
            pdata.map(_data => {
              plays.push(_data.value);
            })
          }
          break;

        // 首集id
        case 2:
        // 电视剧
        case 4:
        // 动漫
        case 15:
          // 儿童
          uri = `http://cache.video.iqiyi.com/jp/avlist/${vdata.vid}/`;
          ldata = await epona.queue(uri);
          episode = ldata.episode - 0;
          // console.log(ldata);
          if (ldata.ids && ldata.ids.length >= 1) {
            vids = ldata.ids.slice(0, 1);
            uri = `http://mixer.video.iqiyi.com/jp/mixin/videos/${vids[0]}/`;
            pdata = await epona.queue(uri);
            plays.push(pdata.value);
          } else if (vdata.cid === 15) {
            // 部分儿童电影 --> 年兽大作战
            uri = `http://cache.video.iqiyi.com/jp/sdlst/${vdata.cid}/${vdata.vid}/`;
            ldata = await epona.queue(uri);
            // console.log(ldata);
            let uris = ldata.years.map(year => `http://cache.video.qiyi.com/jp/sdvlst/${vdata.cid}/${vdata.vid}/${year}/`);

            ldata = await epona.queue(uris);
            // console.log(ldata);
            ldata.map(_data => {
              Array.prototype.push.apply(vids, _data.ids);
            })
            // console.log(vids);
            uris = vids.map(vid => `http://mixer.video.iqiyi.com/jp/mixin/videos/${vid}/`);
            // console.log(uris);
            pdata = await epona.queue(uris);
            // console.log(pdata);
            pdata.map(_data => {
              plays.push(_data.value);
            })
          } else if (vdata.cid === 4) {
            // 部分动漫电影 --> 熊出没·奇幻空间
            uri = `http://mixer.video.iqiyi.com/jp/mixin/videos/${vdata.vid}/`;
            pdata = await epona.queue(uri);
            // console.log(pdata);
            vids.push(vdata.vid);
            plays.push(pdata.value);
          } else {
            // 部分电视剧 --> 神剧亮了
            let uris;
            if (film.show_type === 1) {
              uris = [`http://cache.video.qiyi.com/jp/sdvlst/${vdata.cid}/${vdata.vid}/${film.year}/`];
            } else {
              uri = `http://cache.video.iqiyi.com/jp/sdlst/${vdata.cid}/${vdata.vid}/`;
              ldata = await epona.queue(uri);
              // console.log(ldata);
              uris = ldata.years.map(year => `http://cache.video.qiyi.com/jp/sdvlst/${vdata.cid}/${vdata.vid}/${year}/`);
            }
            ldata = await epona.queue(uris);
            // console.log(ldata);
            ldata.map(_data => {
              Array.prototype.push.apply(vids, _data.ids);
            })
            // console.log(vids);
            uris = vids.map(vid => `http://mixer.video.iqiyi.com/jp/mixin/videos/${vid}/`);
            // console.log(uris);
            pdata = await epona.queue(uris);
            // console.log(pdata);
            pdata.map(_data => {
              plays.push(_data.value);
            })
          }
          break;

        // 多个ids
        case 3:
        // 纪录片
        case 5:
        // 音乐
        case 6:
        // 综艺
        case 7:
        // 娱乐
        case 8:
        // 游戏
        case 9:
        // 旅游
        case 13:
        // 时尚
        case 17:
        // 体育
        case 21:
        // 生活
        case 22:
        // 搞笑
        case 24:
        // 财经
        case 25:
        // 资讯
        case 26:
        // 汽车
        case 27:
        // 原创
        case 28:
        // 军事
        case 29:
        // 母婴
        case 30:
        // 科技
        case 31:
        // 脱口秀
        case 32:
          // 健康
          let uris;
          if (film.show_type === 1) {
            uris = [`http://cache.video.qiyi.com/jp/sdvlst/${vdata.cid}/${vdata.vid}/${film.year}/`];
          } else {
            uri = `http://cache.video.iqiyi.com/jp/sdlst/${vdata.cid}/${vdata.vid}/`;
            ldata = await epona.queue(uri);
            // console.log(ldata);
            if (!ldata.years) {
              // 部分只显示一个总播放量的剧目
              // 原创网络剧 --> 恋上播霸
              // 纪录片 --> 大国外交
              uri = `http://cache.video.iqiyi.com/jp/avlist/${vdata.vid}/`;
              ldata = await epona.queue(uri);
              episode = ldata.episode - 0;
              // console.log(ldata);
              if (ldata.ids && ldata.ids.length >= 1) {
                vids = ldata.ids.slice(0, 1);
                uri = `http://mixer.video.iqiyi.com/jp/mixin/videos/${vids[0]}/`;
                pdata = await epona.queue(uri);
                plays.push(pdata.value);
                break;
              }
            } else {
              uris = ldata.years.map(year => `http://cache.video.qiyi.com/jp/sdvlst/${vdata.cid}/${vdata.vid}/${year}/`);
            }
          }
          ldata = await epona.queue(uris);
          // console.log(ldata);
          ldata.map(_data => {
            Array.prototype.push.apply(vids, _data.ids);
          })
          // console.log(vids);
          uris = vids.map(vid => `http://mixer.video.iqiyi.com/jp/mixin/videos/${vid}/`);
          // console.log(uris);
          pdata = await epona.queue(uris);
          // console.log(pdata);
          pdata.map(_data => {
            plays.push(_data.value);
          })
          break;

        default:
          console.error(`channel id ${vdata.cid} is error.`);
          break;
      }
      return {
        vids,
        plays,
        episode: episode || plays.length,
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
  '综艺': '6',
  '动漫': '4',
  '纪录片': '3',
  '网络电影': '16',
  '资讯': '25',
}
const searchIqiyi = async (params) => {
  try {
    let { type, year = 2017 } = params;
    let ntype = name_map[type];
    let page = 1;
    let uri = `http://list.iqiyi.com/www/${ntype}/-----------${year}--4-1-1---.html`;
    let pdata = await epona.queue(uri);
    let { next = '', items = [] } = pdata
    let videos = items;
    while (!next.includes('下一页')) {
      ++page;
      uri = `http://list.iqiyi.com/www/${ntype}/-----------${year}--4-${page}-1---.html`;
      pdata = await epona.queue(uri);
      let { items = [] } = pdata
      videos = videos.concat(items)
      next = pdata.next || ''
    }
    // console.log(videos);
    return videos;
  } catch (error) {
    console.error(error);
  }
}

(async () => {
  // let uri = `http://list.iqiyi.com/www/2/17----------0-2017--4-1-1---.html`;
  // let pdata = await epona.queue(uri);
  await searchIqiyi({ type: '电视剧' })
})()

export { crawlIqiyi, searchIqiyi }