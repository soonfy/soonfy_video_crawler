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
const _ = require("lodash");
const epona = Epona.new({ concurrent: 10 });
epona
    .on(['v.qq.com/detail'], {
    text: {
        sels: ['#_mod_comments::r-props'],
    },
    episode: {
        sels: ['._playsrc_series .item *'],
        filters: (items) => {
            return items.map(x => x.trim() - 0);
        }
    },
    episode_all: {
        sels: ['._playsrc_series .item_all a::data-range'],
    },
    play: {
        sels: ['._playsrc .btn_primary .icon_text']
    }
})
    .type('xml')
    .then((data, resp) => {
    let text = data.text.replace(/\'/g, '"').replace(/\;/g, ',').replace(/\s+/g, '').replace(/\,\}/g, '}').replace('id', '"vid"').replace('type', '"cid"').replace('movComSet', '"tmovComSet"');
    let id = JSON.parse(text);
    data.vid = id.vid;
    data.cid = id.cid - 0;
    if (data.episode_all) {
        data.episode_all = data.episode_all.split('-')[1] - 0;
    }
    if (data.episode) {
        data.episode = data.episode.filter(x => x && x - 0).slice(-1)[0];
    }
    if (data.episode || data.episode_all) {
    }
    else if (data.play) {
        data.episode = 1;
    }
    return data;
})
    .catch((error) => {
    console.error(error);
});
epona
    .on(['cover'], {
    vid: {
        sels: [/columnid\:\s*\"?([\w\d]+)\"?\,/,
            /id\:\s*\"?([\w\d]+)\"?\,/,
            /\"cover\_id\"\:\"([\w\d]+)\"\,/,
            /\"id\"\:\"([\w\d]+)\"\,/],
        filters: (match) => {
            if (match) {
                return match[1];
            }
        }
    },
    id: {
        sels: [/id\:\s*\"?([\w\d]+)\"?\,/,
            /\"cover\_id\"\:\"([\w\d]+)\"\,/,
            /\"id\"\:\"([\w\d]+)\"\,/],
        filters: (match) => {
            if (match) {
                return match[1];
            }
        }
    },
    bvid: {
        sels: [/column_id\\":\s*\"?([\w\d]+)\"?\,/,
            /c\_column\_id\:\s*\"?([\w\d]+)\"?\,/,
            /\"column\_id\"\:\"([\w\d]+)\"\,/],
        filters: (match) => {
            if (match) {
                return match[1];
            }
        }
    },
    cid: {
        sels: [/var\s*VIDEO\_INFO\s*\=\s*\{[\w\W]+?type\"*\s*\:\s*\"*(\d+)/,
            /var\s*COVER\_INFO\s*\=\s*\{[\w\W]+?typeid\"*\s*\:\s*\"*(\d+)/],
        filters: (match) => {
            if (match) {
                return match[1] - 0;
            }
        }
    },
})
    .type('xml')
    .then((data, resp) => {
    data.vid - 0 === 0 ? data.vid = data.id : '';
    return data;
})
    .catch((error) => {
    console.error(error);
});
epona
    .on(['loadplaylist'], {
    ids: ['playlist *::id'],
    years: ['year *::text()'],
    episode_all: ['video_play_list ::total_episode']
})
    .beforeParse(body => body.match(/QZOutputJson\=([\w\W]*)\;/)[1])
    .type('xml')
    .then((data, resp) => {
    return data;
})
    .catch((error) => {
    console.error(error);
});
epona
    .on(['data.video.qq.com'], {
    value: ['results > *::allnumc'],
})
    .beforeParse(body => body.match(/QZOutputJson\=([\w\W]*)\;/)[1])
    .type('xml')
    .then((data, resp) => {
    data.value ? data.value = data.value[0] - 0 : 0;
    return data;
})
    .catch((error) => {
    console.error(error);
});
epona
    .on(['qq.com/x/list'], {
    items: {
        sels: ['.list_item *'],
        nodes: {
            name: ['.figure_title > a ::text()', '.figure_title > a ::title'],
            uri: ['.figure_title > a ::href'],
            img: ['img ::r-lazyload'],
            id: ['::__wind'],
            roles: ['.figure_desc a *'],
            desc: ['.figure_desc ::title', '.figure_desc ::text()'],
            info: ['.figure_info ::text()'],
            score: ['.figure_score ::text()']
        }
    },
    pages: ['._items a *'],
})
    .type('xml')
    .then((data, resp) => {
    data.items = data.items || [];
    data.items.map(x => {
        x.id = x.id && x.id.replace('cid=', '');
        x.roles = x.roles ? x.roles.map(x => x.trim()) : [];
        x.score = x.score && x.score.replace(/\s+/g, '');
        x.img = x.img && (!x.img.startsWith('http')) ? 'http:' + x.img.trim() : x.img;
    });
    data.max_page = data.pages ? data.pages.slice(-1)[0] : 0;
    return data;
})
    .catch((error) => {
    console.error(error);
});
const crawlQQ = (films) => __awaiter(this, void 0, void 0, function* () {
    try {
        let promises = films.map((film) => __awaiter(this, void 0, void 0, function* () {
            let vids = [], plays = [], episode = 0;
            let vdata = yield epona.queue(film.uri);
            console.log(vdata);
            if (!vdata.vid) {
                console.error(`视频链接错误，未获取到 vid。`);
                return {
                    vids,
                    plays,
                    episode
                };
            }
            episode = vdata.episode;
            let uri, ldata, pdata, uris, value;
            switch (vdata.cid) {
                case 1:
                case 2:
                case 3:
                case 6:
                case 9:
                case 23:
                case 26:
                case 106:
                    uri = `http://data.video.qq.com/fcgi-bin/data?tid=70&appid=10001007&appkey=e075742beb866145&otype=json&idlist=${vdata.vid}`;
                    pdata = yield epona.queue(uri);
                    if (pdata.value) {
                        vids.push(vdata.vid);
                        plays.push(pdata.value);
                    }
                    break;
                case 5:
                case 10:
                case 22:
                case 24:
                case 25:
                case 31:
                case 60:
                    if (vdata.bvid) {
                        vdata.vid = vdata.bvid;
                    }
                    uri = `http://s.video.qq.com/loadplaylist?type=6&plname=qq&otype=json&id=${vdata.vid}`;
                    ldata = yield epona.queue(uri);
                    if (film.show_type === 1) {
                        uri = `http://s.video.qq.com/loadplaylist?type=4&plname=qq&otype=json&id=${vdata.vid}&year=${film.year}`;
                        let _ldata = yield epona.queue(uri);
                        ldata.ids = _ldata.ids;
                    }
                    else {
                        if (ldata.years) {
                            for (let year of ldata.years) {
                                uri = `http://s.video.qq.com/loadplaylist?type=4&plname=qq&otype=json&id=${vdata.vid}&year=${year}`;
                                let _ldata = yield epona.queue(uri);
                                ldata.ids = ldata.ids.concat(_ldata.ids);
                            }
                        }
                        else {
                            ldata.ids = [vdata.vid];
                        }
                    }
                    if (!ldata.ids || ldata.ids.length === 0) {
                        break;
                    }
                    ldata.ids = _.uniq(ldata.ids);
                    vids = ldata.ids || [];
                    uris = ldata.ids.map(x => `http://data.video.qq.com/fcgi-bin/data?tid=70&appid=10001007&appkey=e075742beb866145&otype=json&idlist=${x}`);
                    pdata = yield epona.queue(uris);
                    pdata.map(x => {
                        plays.push(x.value);
                    });
                    episode = plays.length;
                    break;
                default:
                    console.error(`channel id ${vdata.cid} is error.`);
                    break;
            }
            return {
                vids,
                plays,
                episode
            };
        }));
        let data = yield Promise.all(promises);
        console.log(data);
        return data[0];
    }
    catch (error) {
        console.error(error);
    }
});
exports.crawlQQ = crawlQQ;
let name_map = {
    '电影': 'movie',
    '电视剧': 'tv',
    '综艺': 'variety',
    '动漫': 'cartoon',
    '纪录片': 'doco',
    '新闻': 'news',
};
const searchQQ = (params) => __awaiter(this, void 0, void 0, function* () {
    try {
        let { type, year = 2017 } = params;
        let ntype = name_map[type];
        let page = 1;
        let uri = `http://v.qq.com/x/list/${ntype}?iyear=${year}&year=${year}&offset=${30 * (page - 1)}&iarea=-1&sort=19`;
        let pdata = yield epona.queue(uri);
        let { max_page, items = [] } = pdata;
        let videos = items;
        console.log(max_page);
        while (page < max_page) {
            ++page;
            uri = `http://v.qq.com/x/list/${ntype}?iyear=${year}&year=${year}&offset=${30 * (page - 1)}&iarea=-1&sort=19`;
            pdata = yield epona.queue(uri);
            let { items = [] } = pdata;
            videos = videos.concat(items);
        }
        videos = videos.map(x => {
            x.site = 'qq';
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
exports.searchQQ = searchQQ;
(() => __awaiter(this, void 0, void 0, function* () {
    let film = {
        uri: 'https://v.qq.com/x/cover/0r16x32f2ncqgiv.html',
        show_type: -1,
        year: 2017,
    };
}))();
