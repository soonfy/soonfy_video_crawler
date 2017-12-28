import * as fs from 'fs';
import * as moment from 'moment';
import xlsx from 'node-xlsx';

import { Film } from '../models/film';
import InfoExporter from './info_exporter';

// 剧目id，类型，名称，上映年份，开播日期，微博微信关键词，百度指数关键词，豆瓣id，豆瓣类型，豆瓣评分，评分人数，导演，演员，编剧，制作地区，语言，时光网id，出品公司，制作公司，播出平台
// 收官日期，创建时间，电视台，集数，首轮播出电视台，制作类型
const cates = ['体育', '电影', '电视剧', '综艺', '网络剧', '网络综艺', '民生新闻', '动画电影', '动画剧集', '纪录片', '自媒体', '网络大电影', '民生节目', '大型综艺晚会', '广告短片', '其它-电视台', '其它-网络节目', '其它-其它'];
const need = [1, 2, 3, 4, 5];

const start = async () => {
  try {
    console.log(`==============`);
    console.log(`根据 所有 剧目信息`);
    console.log(`==============`);

    let content = [];

    let index = -1;
    for (let cate of cates) {
      console.log(++index);
      if (!need.includes(index)) {
        continue;
      }
      let sheet_name = cate;
      let films = await Film.find({ category: index, status: 1, is_deleted: { $ne: true }, show_type: { $ne: 1 }, });
      let all = films.length;
      console.log(all);
      let data = [['剧目类型', '剧目名称', '剧目id', '上映年份', '开播日期', '收官日期', '微博/微信/百度新闻关键词', '百度指数关键词', '集数',
        '豆瓣链接', '豆瓣类型', '豆瓣评分', '评分人数',
        '导演', '演员', '编剧', '语言', '制作地区', '时光网链接', '出品公司', '制作公司',
        '播出平台', '电视台',
        '添加日期',]];

      let complete = 0;
      while (complete < all) {
        let _films = films.slice(complete, complete + 500);
        await Promise.all(_films.map(async (film) => {
          data.push(await InfoExporter(film._id));
        }))
        complete += _films.length;
      }

      console.log(complete);
      content.push({ name: sheet_name, data });
    }
    let buffer = xlsx.build(content);
    fs.writeFileSync(`./output/剧目数据库-${moment().format('YYYY-MM-DD')}.xlsx`, buffer);
    console.log('end.');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit();
  }
}

start();
