import * as Crawlers from './index';

const start = async () => {
  try {
    console.time('film test');
    let uri = process.argv[2] ? process.argv[2].trim() : 'http://www.mgtv.com/b/293193/4012652.html',
      show_type = -1,
      year = 2017,
      site;
    switch (true) {
      case uri.includes('iqiyi.com'):
        site = 'iqiyi';
        break;
      case uri.includes('qq.com'):
        site = 'qq';
        break;
      case uri.includes('le.com'):
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
    console.timeEnd('film test');
    process.exit();
  } catch (error) {
    console.error(error);
    // await start();
    process.exit();
  }
}

start();