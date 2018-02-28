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
const format_play = (value) => {
    if (value.includes('亿')) {
        value = value.replace(/亿/g, '').replace(/\,/, '') * Math.pow(10, 8);
    }
    else if (value.includes('万')) {
        value = value.replace(/万/g, '').replace(/\,/, '') * Math.pow(10, 4);
    }
    else {
        value = value.replace(/\D/g, '') * 1;
    }
    return parseInt(value, 10);
};
epona
    .on(['show/{id}.html'], {
    luri: {
        sels: ['.btn_more::href']
    }
})
    .type('html')
    .then((data, resp) => __awaiter(this, void 0, void 0, function* () {
    if (data && data.luri) {
        data = yield epona.queue(data.luri);
    }
    return data;
}))
    .catch((error) => {
    console.error(error);
});
epona
    .on(['pptv.com/page/'], {
    id: {
        sels: [/id\"\s*\:\s*\"*([\w\d]+)\"*\s*\,/],
        filters: (match) => match[1]
    },
    pid: {
        sels: [/pid\"\s*\:\s*\"*([\w\d]+)\"*\s*\,/],
        filters: (match) => match[1]
    },
    value: {
        sels: ['.infolist li::text()'],
        filters: (text) => {
            if (typeof text !== 'string') {
                console.log(text);
                return 0;
            }
            let reg_play = /播放\s*\：\s*([\d\.]+[万亿]*)/;
            let match = text.match(reg_play);
            if (match) {
                return format_play(match[1]);
            }
            else {
                console.log(text);
                return 0;
            }
        }
    }
})
    .type('html')
    .then((data, resp) => {
    data.vid = data.pid - 0 !== 0 ? data.pid : data.id;
    return data;
})
    .catch((error) => {
    console.error(error);
});
epona
    .on(['apis.web.pptv.com/show/videoList?pid={pid}'], {
    root: ':: html()',
    total: 'data ::total',
    value: {
        sels: 'data ::pv',
        filters: (value) => format_play(value)
    },
    items: {
        sels: ['list *'],
        nodes: {
            date: ['::date'],
            id: ['::id'],
            value: {
                sels: ['::pv'],
                filters: (value) => format_play(value)
            },
        }
    }
})
    .cookie('ppi=302c31')
    .type('xml')
    .then((data) => {
    return data;
})
    .catch((error) => {
    console.error(error);
});
epona
    .on(['list.pptv.com'], {
    items: {
        sels: ['li *'],
        nodes: {
            name: ['.ui-list-ct .main-tt ::text()'],
            uri: ['.ui-list-ct ::href'],
            ids: ['.ui-list-ct ::tidbit'],
            img: ['.ui-list-ct img ::data-src2'],
            info: ['.ui-list-ct .msk-txt'],
            score: ['.ui-list-ct .ui-txt em'],
            roles: {
                sels: ['.v_info p:first-of-type'],
                filters: (value) => {
                    value = value.split(/['：,]/);
                    value = value && value.slice(1);
                    return value;
                }
            },
            directors: {
                sels: ['.v_info p:last-of-type'],
                filters: (value) => {
                    value = value.split(/['：,]/);
                    value = value && value.slice(1);
                    return value;
                }
            }
        }
    },
})
    .cookie('ppi=302c31')
    .type('xml')
    .then((data) => {
    return data;
})
    .catch((error) => {
    console.error(error);
});
const crawlPptv = (films) => __awaiter(this, void 0, void 0, function* () {
    try {
        let promises = films.map((film) => __awaiter(this, void 0, void 0, function* () {
            let vdata = yield epona.queue(film.uri);
            console.log(vdata);
            let pdata, uri, vids = [], plays = [];
            if (film.show_type === 1) {
                uri = `http://apis.web.pptv.com/show/videoList?pid=${vdata.vid}&vt=22`;
                pdata = yield epona.queue(uri);
                if (!pdata.items || pdata.items.length === 0) {
                    return {
                        vids,
                        plays
                    };
                }
                let items = pdata.items.filter(x => {
                    return x.date && x.date.startsWith(film.year);
                });
                let uris = items.map(x => {
                    vids.push(x.id);
                    return `http://apis.web.pptv.com/show/videoList?pid=${x.id}&vt=22`;
                });
                pdata = yield epona.queue(uris);
                pdata.map(x => {
                    plays.push(x.value);
                });
            }
            else {
                if (vdata.value) {
                    vids.push(vdata.vid);
                    plays.push(vdata.value);
                }
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
exports.crawlPptv = crawlPptv;
let name_map = {
    '电影': '1',
    '电视剧': '2',
    '综艺': '4',
    '动漫': '3',
};
const searchPptv = (params) => __awaiter(this, void 0, void 0, function* () {
    try {
        let { type, year = 2017 } = params;
        let ntype = name_map[type];
        let page = 1;
        let uri;
        if (ntype !== '4') {
            uri = `http://list.pptv.com/channel_list.html?page=${page}&type=${ntype}&year=${year}&sort=time`;
        }
        else {
            uri = `http://list.pptv.com/channel_list.html?page=${page}&type=${ntype}&sort=time`;
        }
        let pdata = yield epona.queue(uri);
        let { items = [] } = pdata;
        let length = items.length;
        let videos = items;
        while (length >= 42) {
            ++page;
            if (ntype !== '4') {
                uri = `http://list.pptv.com/channel_list.html?page=${page}&type=${ntype}&year=${year}&sort=time`;
            }
            else {
                uri = `http://list.pptv.com/channel_list.html?page=${page}&type=${ntype}&sort=time`;
            }
            pdata = yield epona.queue(uri);
            let { items = [] } = pdata;
            videos = videos.concat(items);
            length = items.length;
        }
        videos = videos.map(x => {
            x.site = 'pptv';
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
exports.searchPptv = searchPptv;
