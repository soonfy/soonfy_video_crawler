import * as path from 'path';

import * as filer from 'filer_sf';

// const start = async () => {
//   try {
//     console.log(`==============`);
//     console.log(`导出指定日期分天的播放量`);
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
//     let data = [['剧目类型', '剧目名称', '剧目id', '日期', '总播放量', '爱奇艺总播放量', '腾讯总播放量', '乐视总播放量', '搜狐总播放量', '优酷总播放量', '芒果总播放量']];
//     for (let line of lines) {
//       let cate = typeof line[0] === 'number' ? line[0] : line[0].trim(),
//         name = typeof line[1] === 'number' ? line[1] : line[1].trim(),
//         film_id = typeof line[2] === 'number' ? line[2] : line[2].trim(),
//         start = typeof line[3] === 'number' ? line[3] : line[3].trim(),
//         end = typeof line[4] === 'number' ? line[4] : line[4].trim();
//       // process.exit();
//       let film = await Film.findById(film_id);
//       if (!film) {
//         console.error(`*****************`);
//         console.error(`film id ${film_id} error.`);
//         console.error(`*****************`);
//         process.exit();
//       } else {
//         start = start === 0 ? moment(film.created_at) : typeof start === 'number' ? moment(new Date(end)).subtract(start, 'days') : moment(new Date(start));
//         start = start.startOf('day');
//         end = moment(new Date(end)).endOf('day');
//         console.log(start);
//         console.log(end);
//         let dates = ensure_dates(start, end);
//         if (film.show_type === 2) {
//           console.log(`${name} 分年剧目...`);
//           let films = await Film.find({ from_id: film_id, is_deleted: { $ne: true } });
//           if (films.length > 0) {
//             let promises = sites.map(async (site) => {
//               let sum = [];
//               for (let _film of films) {
//                 let _plays = [];
//                 let fp = await FilmPlist.findOne({ film_id: _film._id, site, status: 0 });
//                 if (!fp) {
//                   // _sum += 0;
//                 } else {
//                   _plays = await CFilmPlistPlayCount.find({ film_plist_id: fp._id, date: { $gte: start, $lte: end } });
//                 }
//                 _plays = ensure_plays(_plays, start, end);
//                 _plays.map((play, index) => {
//                   if (sum[index]) {
//                     sum[index].value += play.value;
//                   } else {
//                     sum[index] = play;
//                   }
//                 })
//               }
//               return sum;
//             })
//             let plays = await Promise.all(promises);
//             dates.map((item, index) => {
//               let _line = line.slice(0, 3);
//               _line.push(item.date);
//               let _temp = [];
//               plays.map(site => {
//                 _temp.push(site[index].value);
//               })
//               _temp.unshift(_temp.reduce((a, b) => a + b, 0));
//               _line = _line.concat(_temp);
//               data.push(_line);
//             })
//             continue;
//           } else {
//             console.error(`*****************`);
//             console.error(`${name} 分年剧目却没有找到分年子剧目...`);
//             console.error(`*****************`);
//             console.log(`${name} 采用不分年剧目导出...`);
//             console.error(`*****************`);
//           }
//         }
//         console.log(`${name} 不分年剧目...`);
//         let promises = sites.map(async (site) => {
//           let _plays = [];
//           let fp = await FilmPlist.findOne({ film_id: film._id, site, status: 0 });
//           if (!fp) {
//             // return 0;
//           } else {
//             _plays = await CFilmPlistPlayCount.find({ film_plist_id: fp._id, date: { $gte: start, $lte: end } });
//           }
//           _plays = ensure_plays(_plays, start, end);
//           return _plays;
//         })
//         let plays = await Promise.all(promises);
//         console.log(plays);
//         dates.map((item, index) => {
//           let _line = line.slice(0, 3);
//           _line.push(item.date);
//           let _temp = [];
//           plays.map(site => {
//             _temp.push(site[index].value);
//           })
//           _temp.unshift(_temp.reduce((a, b) => a + b, 0));
//           _line = _line.concat(_temp);
//           data.push(_line);
//         })
//       }
//     }
//     // console.log(data);

//     let file = path.join(__dirname, `../../output/${argv}-daily-result.xlsx`);
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


import DailyExporter from './daily_exporter';
import YearExporter from './year_exporter';

const start = async () => {
  try {
    console.log(`==============`);
    console.log(`导出指定日期分天的播放量`);
    console.log(`==============`);
    let argv = process.argv[2],
      year = process.argv[3];

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
    let data = [['剧目类型', '剧目名称', '剧目id', '日期', '总新增播放量', '爱奇艺新增总播放量', '腾讯新增总播放量', '乐视新增总播放量', '搜狐新增总播放量', '优酷新增总播放量', '芒果新增总播放量', 'PPTV新增总播放量']];
    if (year && year.trim() === 'year') {
      for (let line of lines) {
        let film_id = typeof line[2] === 'number' ? line[2] : line[2].trim(),
          start = typeof line[3] === 'number' ? line[3] : line[3].trim(),
          end = typeof line[4] === 'number' ? line[4] : line[4].trim();
        let result = await YearExporter(film_id, start, end);
        data = data.concat(result);
      }
    } else {
      for (let line of lines) {
        let film_id = typeof line[2] === 'number' ? line[2] : line[2].trim(),
          start = typeof line[3] === 'number' ? line[3] : line[3].trim(),
          end = typeof line[4] === 'number' ? line[4] : line[4].trim();
        let result = await DailyExporter(film_id, start, end);
        data = data.concat(result);
      }
    }

    let file = path.join(__dirname, `../../output/${argv}-daily-result.xlsx`);
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

start();
