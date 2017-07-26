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

export { crawlMgtv }