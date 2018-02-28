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
const reg_vid = /www\.let?v?\.com\/\w+\/([\w\d]+)\.html/;
epona
    .on(['tv.sohu.com/s'], {
    vid: {
        sels: [/var\s*playlistId\s*\=\s*\"*(\d+)/],
        filters: (match) => match[1] - 0 + ''
    },
})
    .type('html')
    .then((data, resp) => {
    data.cid = 7;
    return data;
})
    .catch((error) => {
    console.error(error);
});
epona
    .on(['tv.sohu.com/20'], {
    vid: {
        sels: [/var\s*playlistId\s*\=\s*\"*(\d+)/],
        filters: (match) => match[1] - 0 + ''
    },
    cid: {
        sels: [/var\s*cid\s*\=\s*\"*(\d+)/],
        filters: (match) => match[1] - 0
    }
})
    .type('html')
    .then((data, resp) => {
    return data;
})
    .catch((error) => {
    console.error(error);
});
epona
    .on(['film.sohu.com'], {
    vid: {
        sels: ['#vid::value', '#tvid::value'],
        filters: (text) => text.length > 0 && text.split(/\s*\,/)[0]
    }
})
    .type('html')
    .then((data, resp) => {
    data.cid = 0;
    return data;
})
    .catch((error) => {
    console.error(error);
});
epona
    .on(['count.vrs.sohu.com'], {
    value: {
        sels: ['plids > *::total', 'vids > *::total'],
    }
})
    .type('xml')
    .then((data) => {
    if (data.value.length === 1) {
        data.value = data.value[0] - 0;
    }
    else {
        data.value = 0;
    }
    return data;
})
    .catch((error) => {
    console.error(error);
});
epona
    .on(['pl.hd.sohu.com'], {
    date: {
        sels: ['months > *'],
        nodes: {
            year: ['::tag()'],
            month: ['::text()']
        }
    },
    items: {
        sels: ['videos *'],
        nodes: {
            date: ['::showDate'],
            id: ['::vid']
        }
    }
})
    .type('xml')
    .then((data) => {
    return data;
})
    .catch((error) => {
    console.error(error);
});
epona
    .on(['so.tv.sohu.com/list_'], {
    items: {
        sels: ['.st-list li *'],
        nodes: {
            name: ['strong a ::title', 'strong a ::text()'],
            uri: ['strong a ::href'],
            img: ['img ::src'],
            info: ['.maskTx'],
            roles: ['.actor a *'],
        }
    },
    pages: {
        sels: ['.ssPages a *'],
        nodes: {
            page: ['::title', '::text()'],
            uri: ['::href'],
        }
    }
})
    .type('xml')
    .then((data) => {
    data.items = data.items || [];
    data.items.map(x => {
        x.uri.startsWith('http') ? '' : x.uri = `https:${x.uri}`;
        x.img.startsWith('http') ? '' : x.img = `https:${x.img}`;
    });
    return data;
})
    .catch((error) => {
    console.error(error);
});
const crawlSohu = (films) => __awaiter(this, void 0, void 0, function* () {
    try {
        let promises = films.map((film) => __awaiter(this, void 0, void 0, function* () {
            let vids = [], plays = [];
            let vdata = yield epona.queue(film.uri);
            console.log(vdata);
            if (!vdata.vid) {
                console.error(`视频链接错误，未获取到 vid。`);
                return {
                    vids,
                    plays
                };
            }
            let uri, ldata, pdata;
            switch (vdata.cid) {
                case 0:
                    uri = `http://count.vrs.sohu.com/count/queryext.action?vids=${vdata.vid}`;
                    pdata = yield epona.queue(uri);
                    if (pdata.value) {
                        vids.push(vdata.vid);
                        plays.push(pdata.value);
                    }
                    break;
                case 1:
                case 2:
                case 16:
                    uri = `http://count.vrs.sohu.com/count/queryext.action?plids=${vdata.vid}`;
                    pdata = yield epona.queue(uri);
                    if (pdata.value) {
                        vids.push(vdata.vid);
                        plays.push(pdata.value);
                    }
                    break;
                case 7:
                case 8:
                    if (film.show_type === 1) {
                        uri = `http://pl.hd.sohu.com/videolist?playlistid=${vdata.vid}&order=1`;
                        ldata = yield epona.queue(uri);
                        if (!ldata.items || ldata.items.length === 0) {
                            break;
                        }
                        let items = ldata.items.filter(x => {
                            return x.date && x.date.startsWith(film.year);
                        });
                        let uris = items.map(x => {
                            vids.push(x.id);
                            return `http://count.vrs.sohu.com/count/queryext.action?vids=${x.id}`;
                        });
                        pdata = yield epona.queue(uris);
                        pdata.map(x => {
                            plays.push(x.value);
                        });
                    }
                    else {
                        uri = `http://count.vrs.sohu.com/count/queryext.action?plids=${vdata.vid}`;
                        pdata = yield epona.queue(uri);
                        if (pdata.value) {
                            vids.push(vdata.vid);
                            plays.push(pdata.value);
                        }
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
exports.crawlSohu = crawlSohu;
let name_map = {
    '电影': '100',
    '电视剧': '101',
    '综艺': '106',
    '动漫': '115',
    '纪录片': '107',
    '新闻': '122',
};
const searchSohu = (params) => __awaiter(this, void 0, void 0, function* () {
    try {
        let { type, year = 2017 } = params;
        let ntype = name_map[type];
        let page = 1, max_page;
        let uri = `https://so.tv.sohu.com/list_p1${ntype}_p2_p3_p4${year}_p5_p6_p73_p8_p9_p10_p11_p12_p131.html`;
        let pdata = yield epona.queue(uri);
        let { pages, items = [] } = pdata;
        let videos = items;
        if (pages) {
            pages.map(x => {
                if (x.page - 0) {
                    max_page = x.page - 0;
                }
            });
        }
        while (page < max_page) {
            ++page;
            let next = `https://so.tv.sohu.com/list_p1${ntype}_p2_p3_p4${year}_p5_p6_p73_p8_p9_p10${page}_p11_p12_p131.html`;
            pdata = yield epona.queue(next);
            let { items = [] } = pdata;
            videos = videos.concat(items);
        }
        console.log(videos);
        videos = videos.map(x => {
            x.site = 'sohu';
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
exports.searchSohu = searchSohu;
