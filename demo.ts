import * as Crawlers from './index';

const start = async () => {
  try {
    console.time('film test');
    let uri = 'https://v.qq.com/x/cover/7rf2u4ypyd15iiy/l0023u81vqw.html',
      site = 'qq',
      show_type = -1,
      year = 2017;
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