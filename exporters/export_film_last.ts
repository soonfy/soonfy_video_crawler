import * as fs from 'fs';
import xlsx from 'node-xlsx';
import * as moment from 'moment';

import InfoExporter from './info_exporter';
import { Film } from '../models/film';

const starter = async () => {
  try {
    console.log(`==============`);
    console.log(`根据 添加日期 导出剧目信息, 默认最近 1 个月`);
    console.log(`第二个参数是日期，例如 2017-12-12`);
    console.log(`==============`);
    let date = process.argv[2];

    let content = [];

    let sheet_data = [['剧目类型', '剧目名称', '剧目id', '上映年份', '开播日期', '收官日期', '微博/微信/百度新闻关键词', '百度指数关键词', '集数',
      '豆瓣链接', '豆瓣类型', '豆瓣评分', '评分人数',
      '导演', '演员', '编剧', '语言', '制作地区', '时光网链接', '出品公司', '制作公司',
      '播出平台', '电视台',
      '添加日期']];

    if (date && date.trim()) {
      date = moment(date).startOf('day');
    } else {
      date = moment().startOf('month');
    }

    console.log(date);

    let films = await Film.find({ status: 1, is_deleted: { $ne: true }, show_type: { $ne: 1 }, created_at: { $gte: date } });
    console.log(films.length);
    for (let film of films) {
      let result = await InfoExporter(film._id);
      sheet_data.push(result);
    }
    content.push({ name: '最近添加剧目信息', data: sheet_data });
    let buffer = xlsx.build(content);
    fs.writeFileSync(`./output/最近添加剧目信息-${moment().format('YYYY-MM-DD')}.xlsx`, buffer);

    console.log(`==============`);

    console.log('end.');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit();
  }
}

starter();
