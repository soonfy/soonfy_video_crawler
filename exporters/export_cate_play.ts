import * as path from 'path';

import * as filer from 'filer_sf';


// const start = async () => {
//   try {
//     console.log(`==============`);
//     console.log(`导出所有剧目指定日期总播放量和播放增量`);
//     console.log(`==============`);
//     let argv = process.argv[2];
//     if (argv) {
//       argv = argv.trim();
//     } else {
//       console.error(`*****************`);
//       console.error(`input file path...`);
//       console.error(`*****************`);
//       process.exit();
//     }
//     let input = path.join(__dirname, `../../input/${argv}.xlsx`);
//     let lines = filer.read(input);
//     console.log(`==============`);
//     console.log(`输入文件内容`);
//     console.log(lines);
//     console.log(`==============`);
//     lines = lines['播放量'];
//     lines.shift();
//     let data = [['剧目类型', '剧目名称', '剧目id', '开始日期', '结束日期', '总播放量', '爱奇艺总播放量', '腾讯总播放量', '乐视总播放量', '搜狐总播放量', '优酷总播放量', '芒果总播放量', '期间播放增量', '爱奇艺期间播放增量', '腾讯期间播放增量', '乐视期间播放增量', '搜狐期间播放增量', '优酷期间播放增量', '芒果期间播放增量', '上映年份', '开播日期', '收官日期', '电视台']];
//     for (let line of lines) {
//       let films, cate = typeof line[0] === 'number' ? ensure_cate(line[0]) : line[0].trim(), cate_id = ensure_cate(cate);
//       if (cate === '全部类型' && cate_id === -1) {
//         films = await Film.find({ status: 1, is_deleted: { $ne: true }, show_type: { $ne: 1 }, });
//       } else {
//         films = await Film.find({ category: cate_id, status: 1, is_deleted: { $ne: true }, show_type: { $ne: 1 }, });
//       }
//       console.log(`类型 ${cate} 总共 ${films.length} 条剧目。`);
//       if (films.length === 0) {
//         console.log(`请确认视频类型。`);
//         console.log(cates);
//       }
//       let _start = line[1],
//         end = line[2] && line[2].trim();
//       end = moment(new Date(end)).endOf('day');
//       for (let film of films) {
//         let year = film.year || '没有上映年份数据',
//           tvs = film.tvs,
//           release_date = film.release_date ? moment(film.release_date).format('YYYY-MM-DD') : '没有开播日期',
//           ending_date = film.ending_date ? moment(film.ending_date).format('YYYY-MM-DD') : '没有收官日期';
//         if(tvs && tvs.length > 0){
//           tvs = await Promise.all(tvs.map(async (x) => (await TV.findOne({_id: x})).name));
//         }else{
//           tvs = ['没有电视台数据'];
//         }
//         let cate = ensure_cate(film.category);
//         if (!cate) {
//           console.error(`================`);
//           console.error(`未匹配类型，已跳过。`);
//           console.error(film);
//           console.error(`================`);
//           continue;
//         } else {
//           let name = film.name.trim(),
//             film_id = film._id,
//             start = _start === 0 ? moment(film.created_at) : typeof _start === 'number' ? moment(new Date(end)).subtract(_start - 1, 'days') : moment(new Date(_start.trim()));
//           start = start.startOf('day');
//           console.log(start);
//           console.log(end);
//           if (film.show_type === 2) {
//             console.log(`${name} 分年剧目...`);
//             let films = await Film.find({ from_id: film_id, is_deleted: { $ne: true } });
//             if (films.length > 0) {
//               let promises = sites.map(async (site) => {
//                 let _sum = 0,
//                   _offset = 0;
//                 for (let _film of films) {
//                   let fp = await FilmPlist.findOne({ film_id: _film._id, site, status: 0 });
//                   if (!fp) {
//                     // _sum += 0;
//                   } else {
//                     let last = await CFilmPlistPlayCount.findOne({ film_plist_id: fp._id, date: { $lte: end, $gte: start } }, '', { sort: { date: -1 } });
//                     let last_l = await CFilmPlistPlayCount.findOne({ film_plist_id: fp._id, date: { $lte: end, $gte: start } }, '', { sort: { date: 1 } });
//                     last = last ? last : { value: 0 };
//                     last_l = last_l ? last_l : { value: 0 };
//                     if (last) {
//                       _sum += last.value;
//                       _offset += (last.value - last_l.value);
//                     } else {
//                       // _sum += 0;
//                     }
//                   }
//                 }
//                 return { _sum, _offset };
//               })
//               let plays = await Promise.all(promises);
//               let _line = line.slice(1, 3);
//               _line.unshift(film_id);
//               _line.unshift(name);
//               _line.unshift(cate);
//               let sum = plays.map(x => x._sum).reduce((a, b) => a + b, 0);
//               _line.push(sum);
//               _line = _line.concat(plays.map(x => x._sum));
//               let offset = plays.map(x => x._offset).reduce((a, b) => a + b, 0);
//               _line.push(offset);
//               _line = _line.concat(plays.map(x => x._offset));
//               _line = _line.concat([year, release_date, ending_date, tvs.join(' ; ')]);
//               data.push(_line);
//               continue;
//             } else {
//               console.error(`*****************`);
//               console.error(`${name} 分年剧目却没有找到分年子剧目...`);
//               console.error(`*****************`);
//               console.log(`${name} 采用不分年剧目导出...`);
//               console.error(`*****************`);
//             }
//           }
//           console.log(`${name} 不分年剧目...`);
//           let promises = sites.map(async (site) => {
//             let _sum = 0,
//               _offset = 0;
//             let fp = await FilmPlist.findOne({ film_id: film._id, site, status: 0 });
//             if (!fp) {
//               // return 0;
//             } else {
//               let last = await CFilmPlistPlayCount.findOne({ film_plist_id: fp._id, date: { $lte: end, $gte: start } }, '', { sort: { date: -1 } });
//               let last_l = await CFilmPlistPlayCount.findOne({ film_plist_id: fp._id, date: { $lte: end, $gte: start } }, '', { sort: { date: 1 } });
//               last = last ? last : { value: 0 };
//               last_l = last_l ? last_l : { value: 0 };
//               if (last) {
//                 _sum = last.value;
//                 _offset = last.value - last_l.value;
//               }
//             }
//             return { _sum, _offset };
//           })
//           let plays = await Promise.all(promises);
//           let sum = plays.map(x => x._sum).reduce((a, b) => a + b, 0);
//           let _line = line.slice(1, 3);
//           _line.unshift(film_id);
//           _line.unshift(name);
//           _line.unshift(cate);
//           _line.push(sum);
//           _line = _line.concat(plays.map(x => x._sum));
//           let offset = plays.map(x => x._offset).reduce((a, b) => a + b, 0);
//           _line.push(offset);
//           _line = _line.concat(plays.map(x => x._offset));
//           _line = _line.concat([year, release_date, ending_date, tvs.join(' / ')]);
//           data.push(_line);
//         }
//       }
//     }
//     // console.log(data);
//     let file = path.join(__dirname, `../../output/${argv}-category-result.xlsx`);
//     filer.write(file, data);
//     console.log(`=================`);
//     console.log(`file output ${file}`);
//     console.log(`=================`);
//     process.exit();
//   } catch (error) {
//     console.error(error);
//     process.exit();
//   }
// }
import { Film } from '../models/film';
import SumExporter from './sum_exporter';

const csites = ['爱奇艺', '腾讯', '乐视', '搜狐', '优酷', '芒果'];
const cates = ['体育', '电影', '电视剧', '综艺', '网络剧', '网络综艺', '民生新闻', '动画电影', '动画剧集', '纪录片', '自媒体', '网络大电影', '民生节目', '大型综艺晚会', '广告短片', '其它-电视台', '其它-网络节目', '其它-其它'];

const ensure_cate = (num) => {
  let cate = typeof num === 'number' ? cates[num] : cates.indexOf(num);
  return cate;
}

const starter = async () => {
  try {
    console.log(`==============`);
    console.log(`导出所有剧目指定日期总播放量和播放增量`);
    console.log(`==============`);
    let argv = process.argv[2];
    if (argv) {
      argv = argv.trim();
    } else {
      console.error(`*****************`);
      console.error(`input file path...`);
      console.error(`*****************`);
      process.exit();
    }
    let input = path.join(__dirname, `../../input/${argv}.xlsx`);
    let lines = filer.read(input);
    console.log(`==============`);
    console.log(`输入文件内容`);
    console.log(lines);
    console.log(`==============`);
    lines = lines['播放量'];
    lines.shift();
    let data = [['剧目类型', '剧目名称', '剧目id', '是否分年', '开始日期', '结束日期', '播出平台数量', '播出平台1', '播出平台2', '播出平台3', '播出平台4', '播出平台5', '播出平台6', '播出平台7', '总播放量', '爱奇艺总播放量', '腾讯总播放量', '乐视总播放量', '搜狐总播放量', '优酷总播放量', '芒果总播放量', 'PPTV总播放量', '期间总播放增量', '爱奇艺期间播放增量', '腾讯期间播放增量', '乐视期间播放增量', '搜狐期间播放增量', '优酷期间播放增量', '芒果期间播放增量', 'PPTV期间播放增量', '上映年份', '开播日期', '收官日期', '电视台数量', '电视台']];
    for (let line of lines) {
      let films, cate = typeof line[0] === 'number' ? ensure_cate(line[0]) : line[0].trim(), cate_id = ensure_cate(cate);
      if (cate === '全部类型' && cate_id === -1) {
        films = await Film.find({ status: 1, is_deleted: { $ne: true }, show_type: { $ne: 1 }, });
      } else {
        films = await Film.find({ category: cate_id, status: 1, is_deleted: { $ne: true }, show_type: { $ne: 1 }, });
      }
      console.log(`类型 ${cate} 总共 ${films.length} 条剧目。`);
      if (films.length === 0) {
        console.log(`请确认视频类型。`);
        console.log(cates);
      }
      let start = line[1] && line[1].trim(),
        end = line[2] && line[2].trim();
      for (let film of films) {
        let result = await SumExporter(film._id, start, end);
        data.push(result);
      }
    }
    // console.log(data);
    let file = path.join(__dirname, `../../output/${argv}-category-result.xlsx`);
    filer.write(file, data);
    console.log(`=================`);
    console.log(`file output ${file}`);
    console.log(`=================`);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit();
  }
}

starter();
