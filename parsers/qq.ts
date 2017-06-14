import * as Epona from 'eponajs';

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
      sels: [/var\s*VIDEO\_INFO\s*\=\s*\{[\w\W]+?type\"*\s*\:\s*\"*(\d+)/],
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
    let film = films[0];
    let vdata = await epona.queue(film.uri);
    console.log(vdata);
    let uri, ldata, pdata, uris, value;
    switch (vdata.cid) {
      // 单个 id
      // 电影，电视剧
      case 1:
      case 2:
        uri = `http://data.video.qq.com/fcgi-bin/data?tid=70&appid=10001007&appkey=e075742beb866145&otype=json&idlist=${vdata.vid}`;
        pdata = await epona.queue(uri);
        console.log(pdata);
        if (pdata.value) {
          console.log(`腾讯链接正确。`);
        } else {
          console.error(`腾讯链接错误。`);
        }
        break;

      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
      case 10:
        uri = `http://s.video.qq.com/loadplaylist?type=6&plname=qq&otype=json&id=${vdata.vid}`;
        ldata = await epona.queue(uri);
        ldata.ids = [];
        console.log(ldata);
        // console.log(ldata.ids.length);
        for (let year of ldata.years) {
          uri = `http://s.video.qq.com/loadplaylist?type=4&plname=qq&otype=json&id=${vdata.vid}&year=${year}`;
          let _ldata = await epona.queue(uri);
          ldata.ids = ldata.ids.concat(_ldata.ids);
          console.log(_ldata.ids.length);
        }
        console.log(ldata.ids.length);
        uris = ldata.ids.map(x => `http://data.video.qq.com/fcgi-bin/data?tid=70&appid=10001007&appkey=e075742beb866145&otype=json&idlist=${x}`);
        let plays = await epona.queue(uris);
        // console.log(plays);
        value = plays.map(x => x.value).reduce((a, b) => a + b);
        console.log(plays.length);
        console.log(value);
        break;

      default:
        console.error(`channel id ${vdata.cid} is error.`);
        break;
    }
  } catch (error) {
    console.error(error);
  }
}

export { crawlQQ }