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
const film_1 = require("../models/film");
const sum_exporter_1 = require("./sum_exporter");
const csites = ['爱奇艺', '腾讯', '乐视', '搜狐', '优酷', '芒果'];
const cates = ['体育', '电影', '电视剧', '综艺', '网络剧', '网络综艺', '民生新闻', '动画电影', '动画剧集', '纪录片', '自媒体', '网络大电影', '民生节目', '大型综艺晚会', '广告短片', '其它-电视台', '其它-网络节目', '其它-其它'];
const ensure_cate = (num) => {
    let cate = typeof num === 'number' ? cates[num] : cates.indexOf(num);
    return cate;
};
const starter = () => __awaiter(this, void 0, void 0, function* () {
    try {
        console.log(`==============`);
        console.log(`导出所有剧目指定日期总播放量和播放增量`);
        console.log(`==============`);
        let argv = process.argv[2];
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
        let data = [['剧目类型', '剧目名称', '剧目id', '豆瓣评分', '是否分年', '集数', '开始日期', '结束日期', '播出平台数量', '播出平台1', '播出平台2', '播出平台3', '播出平台4', '播出平台5', '播出平台6', '播出平台7', '总播放量', '爱奇艺总播放量', '腾讯总播放量', '乐视总播放量', '搜狐总播放量', '优酷总播放量', '芒果总播放量', 'PPTV总播放量', '期间总播放增量', '爱奇艺期间播放增量', '腾讯期间播放增量', '乐视期间播放增量', '搜狐期间播放增量', '优酷期间播放增量', '芒果期间播放增量', 'PPTV期间播放增量', '上映年份', '开播日期', '收官日期', '电视台数量', '电视台']];
        for (let line of lines) {
            let films, cate = typeof line[0] === 'number' ? ensure_cate(line[0]) : line[0].trim(), cate_id = ensure_cate(cate);
            if (cate === '全部类型' && cate_id === -1) {
                films = yield film_1.Film.find({ status: 1, is_deleted: { $ne: true }, show_type: { $ne: 1 }, });
            }
            else {
                films = yield film_1.Film.find({ category: cate_id, status: 1, is_deleted: { $ne: true }, show_type: { $ne: 1 }, });
            }
            console.log(`类型 ${cate} 总共 ${films.length} 条剧目。`);
            if (films.length === 0) {
                console.log(`请确认视频类型。`);
                console.log(cates);
            }
            let start = line[1] && line[1].trim(), end = line[2] && line[2].trim();
            for (let film of films) {
                let result = yield sum_exporter_1.default(film._id, start, end);
                data.push(result);
            }
        }
        let file = path.join(__dirname, `../../output/${argv}-category-result.xlsx`);
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
starter();
