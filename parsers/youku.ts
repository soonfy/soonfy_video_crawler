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
  .on(['list.youku.com'], {
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

export { crawlYouku }