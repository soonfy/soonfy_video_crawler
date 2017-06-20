import * as Epona from 'eponajs';
import * as _ from 'lodash';
import * as fs from 'fs';

const epona = Epona.new({ concurrent: 10 });

/**
 *
 *  播放页提取 vid, cid
 *
 */
epona
  .on(['iqiyi.com/v_', 'iqiyi.com/dianshiju', 'iqiyi.com/zongyi', 'vip.iqiyi.com', 'iqiyi.com/dianying', 'iqiyi.com/dongman'], {
    vid: ['#videoShopGuideWrap::data-shop-albumid',
      '#widget-qiyu-zebra::data-qiyu-albumid',
      '#playerAreaScore::data-score-tvid',
      // '#flashbox::data-player-tvid',
      '#videoArea::data-player-tvid'],
    cid: {
      sels: /cid\s*:\s*(\d+)\,/,
      filters: (match) => match[1] - 0
    }
  })
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
  .on(['mixer.video.iqiyi.com'], {
    value: ['playCount | numbers'],
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
 *  电视剧提取 ids
 *
 */
epona
  .on(['cache.video.iqiyi.com/jp/avlist/'], {
    ids: ['vlist *::tvQipuId'],
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

const crawlIqiyi = async (films) => {
  try {
    let promises = films.map(async (film) => {
      let vdata = await epona.queue(film.uri);
      // console.log(vdata);
      if (!vdata.vid) {
        console.error(`爱奇艺链接错误。`);
        return;
      }
      let uri, ldata, pdata;
      let vids = [], plays = [];
      switch (vdata.cid) {
        // 单个id
        case 1:
        // 电影
        case 16:
          // 微电影
          vids.push(vdata.vid);
          uri = `http://mixer.video.iqiyi.com/jp/mixin/videos/${vdata.vid}/`;
          pdata = await epona.queue(uri);
          // console.log(pdata);
          plays.push(pdata.value);
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
          // console.log(ldata);
          if (ldata.ids && ldata.ids.length >= 1) {
            vids = ldata.ids.slice(0, 1);
            uri = `http://mixer.video.iqiyi.com/jp/mixin/videos/${vids[0]}/`;
            pdata = await epona.queue(uri);
            plays.push(pdata.value);
          } else {
            // 部分动漫电影 --> 年兽大作战
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
          if (film.showType === 1) {
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
          break;

        default:
          console.error(`channel id ${vdata.cid} is error.`);
          fs.appendFileSync('./logs/iqiyi.ts.log', [film.uri, vdata.cid].join('\t') + '\n', 'utf-8');
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

export { crawlIqiyi }