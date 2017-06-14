import * as Epona from 'eponajs';

const epona = Epona.new({ concurrent: 10 });

/**
 *
 *  播放页提取 vid, cid
 *
 */
epona
  .on(['iqiyi.com/v_', 'iqiyi.com/dianshiju', 'iqiyi.com/zongyi', 'vip.iqiyi.com', 'iqiyi.com/dianying'], {
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
    years: ['data > *::tag()'],
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
    let film = films[0];
    let vdata = await epona.queue(film.uri);
    console.log(vdata);
    if (!vdata.vid) {
      console.error(`爱奇艺链接错误。`);
    }
    let uri, ldata, pdata;
    switch (vdata.cid) {
      // 单个 id
      // 电影，
      case 1:
        uri = `http://mixer.video.iqiyi.com/jp/mixin/videos/${vdata.vid}/`;
        pdata = await epona.queue(uri);
        console.log(pdata);
        if (pdata.value) {
          console.log(`爱奇艺链接正确。`);
        } else {
          console.error(`爱奇艺链接错误。`);
        }
        break;

      case 2:
        uri = `http://cache.video.iqiyi.com/jp/avlist/${vdata.vid}/`;
        ldata = await epona.queue(uri);
        console.log(ldata);
        uri = `http://mixer.video.iqiyi.com/jp/mixin/videos/${ldata.ids[0]}/`;
        pdata = await epona.queue(uri);
        console.log(pdata);
        if (pdata.value) {
          console.log(`爱奇艺链接正确。`);
        } else {
          console.error(`爱奇艺链接错误。`);
        }
        break;

      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
        uri = `http://cache.video.iqiyi.com/jp/sdlst/${vdata.cid}/${vdata.vid}/`;
        ldata = await epona.queue(uri);
        console.log(ldata);
        break;

      case 7:
      case 8:
      case 9:
        break;

      default:
        console.error(`channel id ${vdata.cid} is error.`);
        break;
    }
  } catch (error) {
    console.error(error);
  }
}

export { crawlIqiyi }