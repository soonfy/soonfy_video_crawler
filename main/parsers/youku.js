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
const reg_list = /http\:\/\/list\.youku\.com\/show\/id\_([\w\d]+)\.html/;
const reg_uri = /(http\:\/\/list\.youku\.com\/show\/id\_[\w\d]+\.html)/;
const reg_play = /(http\:\/\/v\.youku\.com\/v_show\/id\_[\w\d=]+\.html)/;
epona
    .on(['youku.com/v_show/id_'], {
    luri: [".desc-link::href", '.tvinfo a::href']
})
    .type('html')
    .then((data) => {
    if (data.luri && !data.luri.startsWith('http')) {
        data.luri = `http:${data.luri}`;
    }
    return data;
})
    .catch((error) => {
    console.error(error);
});
epona
    .on(['list.youku.com/show/id_'], {
    value: {
        sels: ['.s-body .p-base li *::text()'],
        filters: (texts) => {
            texts = texts.filter(text => {
                return text && text.includes('总播放数');
            });
            if (texts.length !== 1) {
                return null;
            }
            else {
                let text = texts[0];
                return text.replace(/\D/g, '') - 0;
            }
        }
    },
    showid: {
        sels: ['script *::text()'],
        filters: (texts) => {
            texts = texts.filter(text => {
                return text && text.includes('PageConfig');
            });
            if (texts.length !== 1) {
                return null;
            }
            else {
                let text = texts[0];
                let match = text.match(/showid\:\"([\w\d]+)\"/);
                return match ? match[1] : null;
            }
        }
    },
    episode: {
        sels: ['.p-renew::text()'],
    },
})
    .type('html')
    .then((data) => {
    if (data.episode) {
        let match = data.episode.match(/(\d+)集全/);
        if (match) {
            data.episode = match[1] - 0;
        }
        else {
            match = data.episode.match(/更新至(\d+)集/);
            if (match) {
                data.episode = match[1] - 0;
            }
            else {
                data.episode = 0;
            }
        }
    }
    return data;
})
    .catch((error) => {
    console.error(error);
});
epona
    .on(['list.youku.com/category/show/c_'], {
    items: {
        sels: ['.yk-col4 *'],
        nodes: {
            name: ['.title a ::title', '.title a ::text()'],
            uri: ['.title a ::href'],
            img: ['img ::src'],
            roles: ['.actor a *'],
            info: ['.p-time ::text()'],
            desc: ['.actor + li ::text()'],
        }
    },
    pages: ['.yk-pages li * ::text()']
})
    .type('xml')
    .then((data) => {
    data.items = data.items || [];
    data.items.map(x => {
        x.uri.startsWith('http') ? '' : x.uri = `http:${x.uri}`;
        x.img.startsWith('http') ? '' : x.img = `http:${x.img}`;
    });
    if (data.pages) {
        data.max_page = data.pages.slice(-2)[0];
    }
    else {
        data.max_page = 0;
    }
    return data;
})
    .catch((error) => {
    console.error(error);
});
const crawlYouku = (films) => __awaiter(this, void 0, void 0, function* () {
    try {
        let promises = films.map((film) => __awaiter(this, void 0, void 0, function* () {
            let vids = [], plays = [];
            let uri = film.uri;
            let match = film.uri && film.uri.match(reg_play);
            if (match) {
                let ldata = yield epona.queue(film.uri);
                console.log(ldata);
                if (ldata && ldata.luri) {
                    uri = ldata.luri;
                }
            }
            match = uri && uri.match(reg_uri);
            if (match) {
                uri = match[1];
                match = uri && uri.match(reg_list);
                if (match) {
                    let pdata = yield epona.queue(uri);
                    if (pdata.value) {
                        vids.push(match[1]);
                        plays.push(pdata.value);
                    }
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
exports.crawlYouku = crawlYouku;
let name_map = {
    '电影': '96',
    '电视剧': '97',
    '剧集': '97',
    '综艺': '85',
    '动漫': '100',
};
const searchYouku = (params) => __awaiter(this, void 0, void 0, function* () {
    try {
        let { type, year = 2017 } = params;
        let ntype = name_map[type];
        let page = 1;
        let uri = `http://list.youku.com/category/show/c_${ntype}_r_${year}_s_6_d_1.html`;
        let pdata = yield epona.queue(uri);
        let { max_page, items = [] } = pdata;
        let videos = items;
        console.log(max_page);
        while (page < max_page) {
            ++page;
            uri = `http://list.youku.com/category/show/c_${ntype}_r_${year}_s_6_d_1_p_${page}.html`;
            pdata = yield epona.queue(uri);
            let { items = [] } = pdata;
            videos = videos.concat(items);
        }
        videos = videos.map(x => {
            x.site = 'youku';
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
exports.searchYouku = searchYouku;
