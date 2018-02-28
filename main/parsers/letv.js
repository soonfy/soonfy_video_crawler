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
const reg_list = /www\.let?v?\.com\/\w+\/([\w\d]+).html/;
epona
    .on(['le.com/ptv', 'letv.com/ptv'], {
    uri: ['.Info .more::href'],
    vid: {
        sels: [/var\s*\_\_INFO\_\_\s*\=\s*\{[\w\W]+?pid\"*\s*\:\s*\"*(\d+)/],
        filters: (match) => match[1] - 0 + ''
    },
    cid: {
        sels: [/var\s*\_\_INFO\_\_\s*\=\s*\{[\w\W]+?cid\"*\s*\:\s*\"*(\d+)/],
        filters: (match) => match[1] - 0
    }
})
    .type('html')
    .then((data, resp) => {
    let uri = data.uri;
    if (!data.vid && uri) {
        const reg_vid = /www\.let?v?\.com\/\w+\/([\w\d]+)\.html/;
        let match = uri.match(reg_vid);
        if (match) {
            data.vid = match[1];
        }
    }
    return data;
})
    .catch((error) => {
    console.error(error);
});
epona
    .on(['v.stat.letv.com'], {
    value: ['plist_play_count | numbers', 'media_play_count | numbers'],
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
    .on(['d.api.m.le.com'], {
    years: ['years *'],
    year: ['data ::currentYear'],
    ids: ['list *::vid']
})
    .type('xml')
    .then((data) => {
    return data;
})
    .catch((error) => {
    console.error(error);
});
epona
    .on(['list.le.com/listn/c'], {
    items: {
        sels: ['.dl_list .p_t a *'],
        nodes: {
            name: ['::title', '::text()'],
            uri: ['::href'],
        }
    },
    next: ['.noPage ::text()']
})
    .type('xml')
    .then((data) => {
    console.log(data);
    return data;
})
    .catch((error) => {
    console.error(error);
});
epona
    .on(['list.le.com/apin/chandata.json'], {
    items: {
        sels: ['album_list *'],
        nodes: {
            name: ['::name'],
            vids: ['::vids'],
            pid: ['::aid']
        }
    },
    count: ['album_count | numbers']
})
    .type('xml')
    .then((data) => {
    return data;
})
    .catch((error) => {
    console.error(error);
});
const crawlLetv = (films) => __awaiter(this, void 0, void 0, function* () {
    try {
        let promises = films.map((film) => __awaiter(this, void 0, void 0, function* () {
            let vids = [], plays = [];
            let vdata = {
                vid: null,
                cid: null,
            };
            let match = film.uri.match(reg_list);
            if (match) {
                vdata.vid = match[1];
                vdata.cid = 11;
                console.log(vdata);
            }
            else {
                vdata = yield epona.queue(film.uri);
                console.log(vdata);
                if (!vdata || !vdata.vid) {
                    console.error(`视频链接错误，未获取到 vid。`);
                    return {
                        vids,
                        plays
                    };
                }
            }
            let uri, ldata, pdata;
            switch (vdata.cid) {
                case 1:
                case 2:
                case 5:
                    uri = `http://v.stat.letv.com/vplay/queryMmsTotalPCount?pid=${vdata.vid}`;
                    pdata = yield epona.queue(uri);
                    if (pdata.value) {
                        vids.push(vdata.vid);
                        plays.push(pdata.value);
                    }
                    break;
                case 11:
                case 16:
                    if (film.show_type === 1) {
                        uri = `http://d.api.m.le.com/detail/getPeriod?pid=${vdata.vid}&year=${film.year}&platform=pc`;
                        ldata = yield epona.queue(uri);
                        if (!ldata.ids || ldata.ids.length === 0) {
                            break;
                        }
                        let uris = ldata.ids.map(x => {
                            vids.push(x);
                            return `http://v.stat.letv.com/vplay/queryMmsTotalPCount?vid=${x}`;
                        });
                        pdata = yield epona.queue(uris);
                        pdata.map(x => {
                            plays.push(x.value);
                        });
                    }
                    else {
                        uri = `http://v.stat.letv.com/vplay/queryMmsTotalPCount?pid=${vdata.vid}`;
                        pdata = yield epona.queue(uri);
                        vids.push(vdata.vid);
                        plays.push(pdata.value);
                    }
                    break;
                default:
                    console.error(`channel id ${vdata.cid} is error.`);
                    break;
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
exports.crawlLetv = crawlLetv;
let name_map = {
    '电影': '1',
    '电视剧': '2',
    '综艺': '11',
    '动漫': '5',
    '纪录片': '16',
};
const searchLetv = (params) => __awaiter(this, void 0, void 0, function* () {
    try {
        let { type, year = 2017 } = params;
        let ntype = name_map[type];
        let page = 1;
        let uri = `http://list.le.com/apin/chandata.json?c=${ntype}&d=1&md=&o=9&p=${page}&s=1&y=${year}`;
        let pdata = yield epona.queue(uri);
        let { count, items = [] } = pdata;
        console.log(count);
        let videos = items;
        while (page * 30 < count) {
            ++page;
            uri = `http://list.le.com/apin/chandata.json?c=${ntype}&d=1&md=&o=9&p=${page}&s=1&y=${year}`;
            pdata = yield epona.queue(uri);
            let { items = [] } = pdata;
            videos = videos.concat(items);
        }
        videos = videos.map(x => {
            x.site = 'letv';
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
exports.searchLetv = searchLetv;
