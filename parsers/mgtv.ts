import * as Epona from 'eponajs';

const epona = Epona.new({ concurrent: 10 });
const reg_list = /^http\:\/\/www\.mgtv\.com\/\w+\/(\w+)\.html/;
const reg_play = /^http\:\/\/www\.mgtv\.com\/\w+\/(\w+)\/\w+\.html/;

/**
 *
 *  暂未使用
 *  播放页提取 vid, cid
 *
 */
epona
  .on(['暂未使用'], {
    vid: {
      sels: [/var\s*playlistId\s*\=\s*\"*(\d+)/],

      filters: (match) => match[1] - 0
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
    // console.log(data);
    return data;
  })
  .catch((error) => {
    console.error(error);
  })

/**
 *
 *  暂未使用
 *  综艺提取 years, ids
 *
 */
epona
  .on(['暂未使用'], {
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

export { crawlMgtv }