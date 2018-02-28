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
const Epona = require("eponajs");
const epona = Epona.new({ concurrent: 10 });
const reg_list = /^http\:\/\/www\.mgtv\.com\/\w+\/(\w+)\.html/;
const reg_play = /^http\:\/\/www\.mgtv\.com\/\w+\/(\w+)\/\w+\.html/;
epona
    .on(['vc.mgtv.com'], {
    value: {
        sels: ['data::all'],
        filters: 'numbers'
    }
})
    .type('xml')
    .then((data) => {
    data.value = data.value - 0;
    return data;
})
    .catch((error) => {
    console.error(error);
});
epona
    .on(['list.mgtv.com'], {
    items: {
        sels: ['.m-result-list-item *'],
        nodes: {
            name: ['.u-title ::text()'],
            uri: ['.u-title ::href'],
            img: ['img ::src'],
            roles: ['.u-desc a *'],
            _info: ['.u-title ::onclick'],
        }
    },
    next: ['.next ::href'],
    pages: {
        sels: ['.w-pages a *'],
        nodes: {
            name: ['::text()'],
            uri: ['::href'],
        }
    }
})
    .type('xml')
    .then((data) => {
    data.items.map((x, i) => {
        x.uri.startsWith('http') ? '' : x.uri = `https:${x.uri}`;
        x.uri = x.uri.slice(0, x.uri.indexOf('.html') + 5);
        x.img.startsWith('http') ? '' : x.img = `https:${x.img}`;
    });
    if (data.next) {
        data.next.startsWith('http') ? '' : data.next = `https://list.mgtv.com${data.next}`;
    }
    return data;
})
    .catch((error) => {
    console.error(error);
});
const crawlMgtv = (films) => __awaiter(this, void 0, void 0, function* () {
    try {
        let promises = films.map((film) => __awaiter(this, void 0, void 0, function* () {
            let vids = [], plays = [];
            let match = film.uri && film.uri.match(reg_list) || film.uri.match(reg_play);
            if (match) {
                let uri = `http://vc.mgtv.com/v2/dynamicinfo?cid=${match[1]}`;
                let pdata = yield epona.queue(uri);
                if (pdata.value) {
                    vids.push(match[1]);
                    plays.push(pdata.value);
                }
            }
            else {
                console.error(`视频链接错误，未获取到 vid。`);
            }
            return {
                vids,
                plays
            };
        }));
        let data = yield Promise.all(promises);
        return data[0];
    }
    catch (error) {
        console.error(error);
    }
});
exports.crawlMgtv = crawlMgtv;
let name_map = {
    '电影': '3',
    '电视剧': '2',
    '综艺': '1',
    '动漫': '50',
    '纪录片': '51',
    '新闻': '106',
};
const searchMgtv = (params) => __awaiter(this, void 0, void 0, function* () {
    try {
        let { type, year = 2017 } = params;
        let ntype = name_map[type];
        let page = 1;
        let uri = `https://list.mgtv.com/-------------.html?channelId=${ntype}`;
        let pdata = yield epona.queue(uri);
        let { next = '', items = [] } = pdata;
        let videos = items;
        while (next) {
            pdata = yield epona.queue(next);
            let { items = [] } = pdata;
            videos = videos.concat(items);
            next = pdata.next || '';
        }
        videos = videos.map(x => {
            x.site = 'mgtv';
            x.type = type;
            x.year = year;
            return x;
        });
        return videos;
    }
    catch (error) {
        console.error(error);
    }
});
exports.searchMgtv = searchMgtv;
