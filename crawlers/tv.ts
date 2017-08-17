import * as moment from 'moment';
import * as path from 'path';

import TVPlist from '../models/tv_plist';

import * as Epona from 'eponajs';
const epona = Epona.new({ concurrent: 10 });

import * as filer from 'filer_sf';

epona
  .on(['vfoldervideos'], {
    // root: ':: html()',
    name: ['folderinfo ::title'],
    total: ['video ::total'],
    videos: {
      sels: ['vi *'],
      nodes: {
        title: ['::title'],
        targetid: ['::targetid'],
        vid: ['::vid'],
        date: ['::time'],
        value: ['::view']
      }
    }
  })
  .beforeParse(body => body.match(/QZOutputJson\=([\w\W]*)\;/)[1])
  .cookie('pgv_pvi=4136102912; tvfe_boss_uuid=84121ccca3368484; tvfe_search_uid=1d26517d-56a3-47db-a9ee-08625c61eac9; pgv_si=s1940249600; RK=l+2WOjhKaP; mobileUV=1_15de3d74479_bb8b7; ptisp=; ptui_loginuin=2028296874; pt2gguin=o2028296874; uin=o2028296874; skey=@UOv3ncV9r; luin=o2028296874; lskey=000100002af0fce2f45858351ca6f0e1ae06eeb8be511663105340b0cb939b007fdc682a9a2cfbf4cf9a1ca3; ptcz=8793126f72ba941af73b875dbe58e11f4ff68ce1419e696378ccf9e81e11543d; login_remember=qq; ptag=v.qq.com; pgv_info=ssid=s5552487051; ts_last=v.qq.com/u/videos/; pgv_pvid=1848989208; o_cookie=2028296874; ts_uid=6904715554; main_login=qq; _qddaz=QD.truo0c.est4b5.j6czscx7; encuin=1a0011feaa67161aa6cc1771221b2ef5|2028296874; lw_nick=%E5%B1%B1%E8%A5%BF%E5%8D%AB%E8%A7%86|2028296874|//thirdqq.qlogo.cn/g?b=sdk&k=OUNutxGSqAGWzDnI1JHLkw&s=40&t=1483327029|1')
  .type('xml')
  .then((data) => {
    // console.log(data);
    return data;
  })
  .catch((error) => {
    console.error(error);
  })

const crawler = async (uri) => {
  try {
    // let uri = `http://v.qq.com/u/videos/#cover_edit/pn80005010qepqx`;
    let result = [],
      head = ['剧目名称', '剧目链接', '单集名称', '单集链接', 'vid', 'targetid', '发布日期', '播放量', '采集时间'];
    result.push(head);
    let reg_cid = /\#cover\_edit\/([\w\d]+)/,
      match = uri.match(reg_cid),
      cid = '';
    if (match) {
      cid = match[1];
    } else {
      console.error(`链接 ${uri} 未匹配到cid...`);
      return;
    }
    console.log(cid);
    uri = `http://c.v.qq.com/vfoldervideos?otype=json&cid=${cid}&pagenum=1&vnum=50&sorttype=0`;
    let data = await epona.queue(uri);
    // console.log(data);
    data.videos.map(x => {
      let temp = [data.name, uri, x.title, `https://v.qq.com/x/page/${x.vid}.html`, x.vid, x.targetid, x.date, x.value, moment().format('YYYY-MM-HH')];
      result.push(temp);
    })
    let count = data.videos.length,
      page = 1;
    while (count < data.total - 0) {
      uri = `http://c.v.qq.com/vfoldervideos?otype=json&cid=${cid}&pagenum=${++page}&vnum=50sorttype=0`;
      data = await epona.queue(uri);
      data.videos.map(x => {
        let temp = [data.name, uri, x.title, `https://v.qq.com/x/page/${x.vid}.html`, x.vid, x.targetid, x.date, x.value, moment().format('YYYY-MM-HH')];
        result.push(temp);
      })
      count += data.videos.length;
      // console.log(data);
    }
    console.log(count);
    let file = path.join(__dirname, `../../output/${data.name}-${moment().format('YYYYMMHH')}.xlsx`);
    filer.write(file, result);
    console.log(`=================`);
    console.log(`file output ${file}`);
    console.log(`=================`);
  } catch (error) {
    console.error(error);
  }
}

// crawler();

const start = async () => {
  try {
    let uris = ['http://v.qq.com/u/videos/#cover_edit/pn80005010qepqx',
      'http://v.qq.com/u/videos/#cover_edit/kzw000501s1psio',
      'http://v.qq.com/u/videos/#cover_edit/2r4000501gui5ar'];
    for (let uri of uris) {
      await crawler(uri);
    }
    console.log('all over...');
  } catch (error) {
    console.error(error);
  }
}

start();
