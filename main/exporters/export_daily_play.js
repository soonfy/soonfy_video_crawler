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
const path = require("path");
const filer = require("filer_sf");
const daily_exporter_1 = require("./daily_exporter");
const start = () => __awaiter(this, void 0, void 0, function* () {
    try {
        console.log(`==============`);
        console.log(`导出指定日期分天的播放量`);
        console.log(`==============`);
        let argv = process.argv[2], year = process.argv[3];
        if (argv) {
            argv = argv.trim();
        }
        else {
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
        for (let line of lines) {
            let film_id = typeof line[2] === 'number' ? line[2] : line[2].trim(), start = typeof line[3] === 'number' ? line[3] : line[3].trim(), end = typeof line[4] === 'number' ? line[4] : line[4].trim();
            let result = yield daily_exporter_1.default(film_id, start, end);
            data = data.concat(result);
        }
        let file = path.join(__dirname, `../../output/${argv}-daily-result.xlsx`);
        filer.write(file, data);
        console.log(`=================`);
        console.log(`file output ${file}`);
        console.log(`=================`);
        process.exit();
    }
    catch (error) {
        console.error(error);
        process.exit();
    }
});
start();
