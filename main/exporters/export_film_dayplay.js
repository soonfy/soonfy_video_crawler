"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const node_xlsx_1 = require("node-xlsx");
const moment = require("moment");
const daily_exporter_1 = require("./daily_exporter");
const ensure_cate = (num) => {
    let cate = typeof num === 'number' ? cates[num] : cates.indexOf(num);
    return cate;
};
const starter = () => __awaiter(this, void 0, void 0, function* () {
    try {
        console.log(`==============`);
        console.log(`根据 剧目id 或者 类型 导出分天播放量`);
        console.log(`==============`);
        let argv = process.argv[2];
        if (argv) {
            argv = argv.trim();
        }
        else {
            console.error(`*****************`);
            console.error(`文件路径不正确，不需要带后缀。`);
            console.error(`*****************`);
            process.exit();
        }
        let inbuffer = fs.readFileSync(`./input/${argv}.xlsx`);
        let worksheets = node_xlsx_1.default.parse(inbuffer);
        console.log(worksheets);
        let content = [];
        for (let sheet of worksheets) {
            let sheet_data = [['剧目类型', '剧目名称', '剧目id', '日期', '总新增播放量', '爱奇艺新增总播放量', '腾讯新增总播放量', '乐视新增总播放量', '搜狐新增总播放量', '优酷新增总播放量', '芒果新增总播放量', 'PPTV新增总播放量']];
            if (sheet.name.includes('剧目')) {
                let data = sheet.data;
                data = data.filter(x => x && x.length >= 5);
                data.shift();
                for (let line of data) {
                    console.log(line[1]);
                    let film_id = typeof line[2] === 'number' ? line[2] : line[2].trim(), start = typeof line[3] === 'number' ? line[3] : line[3].trim(), end = typeof line[4] === 'number' ? line[4] : line[4].trim();
                    let result = yield daily_exporter_1.default(film_id, start, end);
                    sheet_data = sheet_data.concat(result);
                }
            }
            content.push({ name: sheet.name, data: sheet_data });
        }
        let buffer = node_xlsx_1.default.build(content);
        fs.writeFileSync(`./output/${argv}-剧目分天播放量-${moment().format('YYYY-MM-DD')}.xlsx`, buffer);
        console.log(`==============`);
        console.log('end.');
        process.exit();
    }
    catch (error) {
        console.error(error);
        process.exit();
    }
});
starter();
