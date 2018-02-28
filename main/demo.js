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
const Crawlers = require("./index");
const start = () => __awaiter(this, void 0, void 0, function* () {
    try {
        console.time('film test');
        let uri = process.argv[2] ? process.argv[2].trim() : 'http://www.iqiyi.com/v_19rr7cwwiw.html', site;
        let show_type = process.argv[3] ? process.argv[3].trim() - 0 : -1, year = process.argv[4] ? process.argv[4].trim() - 0 : 2017;
        switch (true) {
            case uri.includes('iqiyi.com'):
                site = 'iqiyi';
                break;
            case uri.includes('qq.com'):
                site = 'qq';
                break;
            case uri.includes('le.com'):
            case uri.includes('letv.com'):
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
        };
        console.log(_film);
        let cfilm = yield Crawlers.crawl(_film);
        console.log(cfilm);
        console.log('播放量 -->');
        console.log(cfilm.plays.reduce((a, b) => a + b, 0));
        console.timeEnd('film test');
        process.exit();
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
});
start();
