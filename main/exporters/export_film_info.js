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
const info_exporter_1 = require("./info_exporter");
const film_1 = require("../models/film");
const csites = ['爱奇艺', '腾讯', '乐视', '搜狐', '优酷', '芒果', 'pptv'];
const cates = ['体育', '电影', '电视剧', '综艺', '网络剧', '网络综艺', '民生新闻', '动画电影', '动画剧集', '纪录片', '自媒体', '网络大电影', '民生节目', '大型综艺晚会', '广告短片', '其它-电视台', '其它-网络节目', '其它-其它'];
const ensure_cate = (num) => {
    let cate = typeof num === 'number' ? cates[num] : cates.indexOf(num);
    return cate;
};
const starter = () => __awaiter(this, void 0, void 0, function* () {
    try {
        console.log(`==============`);
        console.log(`根据 剧目id 或者 类型 导出剧目信息`);
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
            let sheet_data = [['剧目类型', '剧目名称', '剧目id', '上映年份', '开播日期', '收官日期', '微博/微信/百度新闻关键词', '百度指数关键词', '集数',
                    '豆瓣链接', '豆瓣类型', '豆瓣评分', '评分人数',
                    '导演', '演员', '编剧', '语言', '制作地区', '时光网链接', '出品公司', '制作公司',
                    '播出平台', '电视台',
                    '添加日期']];
            if (sheet.name.includes('剧目')) {
                let data = sheet.data;
                data = data.filter(x => x && x.length >= 5);
                data.shift();
                for (let line of data) {
                    console.log(line[1]);
                    let film_id = typeof line[2] === 'number' ? line[2] : line[2].trim();
                    let result = yield info_exporter_1.default(film_id);
                    sheet_data.push(result);
                }
            }
            else if (sheet.name.includes('类型')) {
                let data = sheet.data;
                data = data.filter(x => x && x.length >= 3);
                data.shift();
                for (let line of data) {
                    let films, cate = typeof line[0] === 'number' ? ensure_cate(line[0]) : line[0].trim(), cate_id = ensure_cate(cate);
                    if (cate === '全部类型' && cate_id === -1) {
                        films = yield film_1.Film.find({ status: 1, is_deleted: { $ne: true }, show_type: { $ne: 1 }, });
                    }
                    else {
                        films = yield film_1.Film.find({ category: cate_id, status: 1, is_deleted: { $ne: true }, show_type: { $ne: 1 }, });
                    }
                    console.log(`类型 ${cate} 总共 ${films.length} 条剧目。`);
                    for (let film of films) {
                        console.log(film.name);
                        let result = yield info_exporter_1.default(film._id);
                        sheet_data.push(result);
                    }
                }
            }
            content.push({ name: sheet.name, data: sheet_data });
        }
        let buffer = node_xlsx_1.default.build(content);
        fs.writeFileSync(`./output/${argv}-剧目信息-${moment().format('YYYY-MM-DD')}.xlsx`, buffer);
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
