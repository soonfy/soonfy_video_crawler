import * as Epona from 'eponajs';

const epona = Epona.new({ concurrent: 10 });

const format_play = (value) => {
  if (value.includes('亿')) {
    value = value.replace(/亿/g, '').replace(/\,/, '') * Math.pow(10, 8)
  } else if (value.includes('万')) {
    value = value.replace(/万/g, '').replace(/\,/, '') * Math.pow(10, 4)
  } else {
    value = value.replace(/\D/g, '') * 1
  }
  return parseInt(value, 10);
}

/**
 *
 *  播放页提取 vid, play
 *
 */
epona
  .on(['pptv.com/page/'], {
    id: {
      sels: [/id\"\s*\:\s*\"*([\w\d]+)\"*\s*\,/],
      filters: (match) => match[1]
    },
    pid: {
      sels: [/pid\"\s*\:\s*\"*([\w\d]+)\"*\s*\,/],
      filters: (match) => match[1]
    },
    value: {
      sels: ['.infolist li::text()'],
      filters: (text) => {
        if (typeof text !== 'string') {
          console.log(text);
          return 0;
        }
        let reg_play = /播放\s*\：\s*([\d\.]+[万亿]*)/;
        let match = text.match(reg_play);
        if (match) {
          return format_play(match[1]);
        } else {
          console.log(text);
          return 0;
        }
      }
    }
  })
  .type('html')
  .then((data, resp) => {
    // console.log(data);
    data.vid = data.pid - 0 !== 0 ? data.pid : data.id;
    return data;
  })
  .catch((error) => {
    console.error(error);
  })

/**
 *
 *  提取 ids, plays
 *
 */
epona
  .on(['pptv.com/show/videoList'], {
    // root: ':: html()',
    total: 'data ::total',
    value: {
      sels: 'data ::pv',
      filters: (value) => format_play(value)
    },
    items: {
      sels: ['list *'],
      nodes: {
        date: ['::date'],
        id: ['::id'],
        value: {
          sels: ['::pv'],
          filters: (value) => format_play(value)
        },
      }
    }
  })
  .cookie('ppi=302c31')
  .type('xml')
  .then((data) => {
    // console.log(data);
    return data;
  })
  .catch((error) => {
    console.error(error);
  })

const crawlAcfun = async (films) => {
  try {
    let promises = films.map(async (film) => {
      let vdata = await epona.queue(film.uri);
      console.log(vdata);
      let pdata, uri, vids = [], plays = [];
      
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

export { crawlAcfun }