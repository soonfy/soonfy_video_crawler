import * as Crawlers from './index';

const start = async () => {
  try {
    console.time('film test');
    let uri = process.argv[2] ? process.argv[2].trim() : 'http://www.iqiyi.com/v_19rr7cwwiw.html',
      site;

    let show_type = process.argv[3] ? process.argv[3].trim() - 0 : -1,
      year = process.argv[4] ? process.argv[4].trim() - 0 : 2017;

    switch (true) {
      case uri.includes('iqiyi.com'):
        site = 'iqiyi';
        break;
      case uri.includes('qq.com'):
        site = 'qq';
        break;
      case uri.includes('le.com'):
      case uri.includes('letv.com'):
        site = 'letv';
        break;
      case uri.includes('sohu.com'):
        site = 'sohu';
        break;
      case uri.includes('youku.com'):
        site = 'youku';
        break;
      case uri.includes('mgtv.com'):
        site = 'mgtv';
        break;
      case uri.includes('pptv.com'):
        site = 'pptv';
        break;

      default:
        console.error('no find site.', uri);
        process.exit();
        break;
    }
    let _film = {
      uri,
      site,
      show_type,
      year
    }
    console.log(_film);
    let cfilm = await Crawlers.crawl(_film);
    console.log(cfilm);
    console.log('播放量 -->');
    console.log(cfilm.plays.reduce((a, b) => a + b, 0));
    console.timeEnd('film test');
    process.exit();
  } catch (error) {
    console.error(error);
    // await start();
    process.exit(1);
  }
}

start();