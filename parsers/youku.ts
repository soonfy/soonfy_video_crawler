import * as Epona from 'eponajs';

const epona = Epona.new({ concurrent: 10 });
const reg_list = /http\:\/\/list\.youku\.com\/show\/id\_([\w\d]+)\.html/;
const reg_uri = /(http\:\/\/list\.youku\.com\/show\/id\_[\w\d]+\.html)/;

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
      let match = film.uri && film.uri.match(reg_uri);
      if (match) {
        film.uri = match[1];
        match = film.uri && film.uri.match(reg_list);
        if (match) {
          let pdata = await epona.queue(film.uri);
          if (pdata.value) {
            vids.push(match[1]);
            plays.push(pdata.value);
          }
        }
        return {
          vids,
          plays
        }
      }
    })
    let data = await Promise.all(promises);
    return data[0];
  } catch (error) {
    console.error(error);
  }
}

export { crawlYouku }