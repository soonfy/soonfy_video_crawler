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
epona
    .on(['iqiyi.com/a_'], {
    vid: ['#widget-playcount::data-playcount-albumid',
        '.album-fun-fav::data-subscribe-albumid',
        '.effect-score::data-score-tvid',
        '.m-feedVideo-conWrap::data-video-albumId'],
    cid: {
        sels: /cid\s*:\s*(\d+)\,/,
        filters: (match) => match[1] - 0
    },
    ids_back: {
        sels: ['.juji-list > *'],
        nodes: {
            vid: ['::data-albumid'],
            cid: ['::data-cid']
        }
    }
})
    .type('xml')
    .then((data, resp) => {
    if (!data.vid && !data.cid && data.ids_back.length > 0) {
        data.vid = data.ids_back[0].vid;
        data.cid = data.ids_back[0].cid - 0;
    }
    return data;
})
    .catch((error) => {
    console.error(error);
});
epona
    .on(['iqiyi.com/v_', 'iqiyi.com/dianshiju', 'iqiyi.com/zongyi', 'vip.iqiyi.com', 'iqiyi.com/dianying', 'iqiyi.com/dongman'], {
    vid: ['#videoShopGuideWrap::data-shop-albumid',
        '#widget-qiyu-zebra::data-qiyu-albumid',
        '#playerAreaScore::data-score-tvid',
        '#videoArea::data-player-tvid',
        '#flashbox::data-player-tvid',
    ],
    cid: {
        sels: /cid\s*:\s*(\d+)\,/,
        filters: (match) => match[1] - 0
    },
    metas: {
        sels: ['meta *'],
        nodes: {
            equiv: ['::http-equiv'],
            content: ['::content']
        }
    }
})
    .type('xml')
    .then((data, resp) => __awaiter(this, void 0, void 0, function* () {
    if (!data.vid && resp.url.includes('vip.iqiyi.com')) {
        let uri;
        data.metas.map(meta => {
            if (meta.equiv === 'refresh') {
                uri = meta.content.match(/(http.+html)/)[1];
            }
        });
        if (uri) {
            data = yield epona.queue(uri);
            delete data.metas;
            return data;
        }
    }
    delete data.metas;
    return data;
}))
    .catch((error) => {
    console.error(error);
});
epona
    .on(['mixer.video.iqiyi.com'], {
    value: ['playCount | numbers'],
})
    .beforeParse(body => body.match(/var\s*tvInfoJs\=([\w\W]*)/)[1])
    .type('xml')
    .then((data) => {
    data.value = data.value - 0;
    return data;
})
    .catch((error) => {
    console.error(error);
});
epona
    .on(['cache.video.iqiyi.com/jp/avlist/'], {
    ids: ['vlist *::tvQipuId'],
    episode_now: ['data::pt'],
    episode_all: ['data::pm'],
    episode: ['data::pn'],
})
    .beforeParse(body => body.match(/var\s*tvInfoJs\=([\w\W]*)/)[1])
    .type('xml')
    .then((data) => {
    return data;
})
    .catch((error) => {
    console.error(error);
});
epona
    .on(['cache.video.iqiyi.com/jp/sdlst/'], {
    years: {
        sels: 'data > *::tag()',
        filters: 'uniq'
    },
})
    .beforeParse(body => body.match(/var\s*tvInfoJs\=([\w\W]*)/)[1])
    .type('xml')
    .then((data) => {
    return data;
})
    .catch((error) => {
    console.error(error);
});
epona
    .on(['cache.video.qiyi.com/jp/sdvlst/'], {
    ids: {
        sels: 'data *::tvQipuId',
        filters: 'uniq'
    },
})
    .beforeParse(body => body.match(/var\s*tvInfoJs\=([\w\W]*)/)[1])
    .type('xml')
    .then((data) => {
    return data;
})
    .catch((error) => {
    console.error(error);
});
epona
    .on(['list.iqiyi.com'], {
    items: {
        sels: ['.site-piclist li *'],
        nodes: {
            name: ['.site-piclist_pic_link ::title', '.site-piclist_pic_link ::alt'],
            uri: ['.site-piclist_pic_link ::href'],
            img: ['img ::src'],
            id: ['.site-piclist_pic_link ::data-qipuid'],
            param: ['.site-piclist_pic_link ::data-searchpingback-param'],
            roles: ['.role_info em *'],
            desc: ['.role_info > a ::title'],
            info: ['.icon-vInfo ::text()'],
            score: ['.score ::text()']
        }
    },
    next: ['.a1 ::text()']
})
    .type('xml')
    .then((data) => {
    data.items = data.items || [];
    data.items.map(x => {
        x.target = x.param.match(/target=([^&]+)&/)[1];
        x.site = x.param.match(/site=([^&]+)&/)[1];
        x.roles = x.roles ? x.roles.map(x => x.trim()).slice(1) : [];
        x.info = x.info && x.info.trim();
        x.img = x.img && (!x.img.startsWith('http')) ? 'http:' + x.img.trim() : x.img;
    });
    return data;
})
    .catch((error) => {
    console.error(error);
});
const crawlIqiyi = (films) => __awaiter(this, void 0, void 0, function* () {
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
                    episode,
                };
            }
            let cid = vdata.cid;
            let uri, ldata, pdata;
            switch (cid) {
                case 1:
                case 16:
                    uri = `http://mixer.video.iqiyi.com/jp/mixin/videos/${vdata.vid}/`;
                    pdata = yield epona.queue(uri);
                    if (pdata.value) {
                        vids.push(vdata.vid);
                        plays.push(pdata.value);
                    }
                    else {
                        let uris;
                        if (film.show_type === 1) {
                            uris = [`http://cache.video.qiyi.com/jp/sdvlst/${vdata.cid}/${vdata.vid}/${film.year}/`];
                        }
                        else {
                            uri = `http://cache.video.iqiyi.com/jp/sdlst/${vdata.cid}/${vdata.vid}/`;
                            ldata = yield epona.queue(uri);
                            uris = ldata.years.map(year => `http://cache.video.qiyi.com/jp/sdvlst/${vdata.cid}/${vdata.vid}/${year}/`);
                        }
                        ldata = yield epona.queue(uris);
                        ldata.map(_data => {
                            Array.prototype.push.apply(vids, _data.ids);
                        });
                        uris = vids.map(vid => `http://mixer.video.iqiyi.com/jp/mixin/videos/${vid}/`);
                        pdata = yield epona.queue(uris);
                        pdata.map(_data => {
                            plays.push(_data.value);
                        });
                    }
                    break;
                case 2:
                case 4:
                case 15:
                    uri = `http://cache.video.iqiyi.com/jp/avlist/${vdata.vid}/`;
                    ldata = yield epona.queue(uri);
                    episode = ldata.episode - 0;
                    if (ldata.ids && ldata.ids.length >= 1) {
                        vids = ldata.ids.slice(0, 1);
                        uri = `http://mixer.video.iqiyi.com/jp/mixin/videos/${vids[0]}/`;
                        pdata = yield epona.queue(uri);
                        plays.push(pdata.value);
                    }
                    else if (vdata.cid === 15) {
                        uri = `http://cache.video.iqiyi.com/jp/sdlst/${vdata.cid}/${vdata.vid}/`;
                        ldata = yield epona.queue(uri);
                        let uris = ldata.years.map(year => `http://cache.video.qiyi.com/jp/sdvlst/${vdata.cid}/${vdata.vid}/${year}/`);
                        ldata = yield epona.queue(uris);
                        ldata.map(_data => {
                            Array.prototype.push.apply(vids, _data.ids);
                        });
                        uris = vids.map(vid => `http://mixer.video.iqiyi.com/jp/mixin/videos/${vid}/`);
                        pdata = yield epona.queue(uris);
                        pdata.map(_data => {
                            plays.push(_data.value);
                        });
                    }
                    else if (vdata.cid === 4) {
                        uri = `http://mixer.video.iqiyi.com/jp/mixin/videos/${vdata.vid}/`;
                        pdata = yield epona.queue(uri);
                        vids.push(vdata.vid);
                        plays.push(pdata.value);
                    }
                    else {
                        let uris;
                        if (film.show_type === 1) {
                            uris = [`http://cache.video.qiyi.com/jp/sdvlst/${vdata.cid}/${vdata.vid}/${film.year}/`];
                        }
                        else {
                            uri = `http://cache.video.iqiyi.com/jp/sdlst/${vdata.cid}/${vdata.vid}/`;
                            ldata = yield epona.queue(uri);
                            uris = ldata.years.map(year => `http://cache.video.qiyi.com/jp/sdvlst/${vdata.cid}/${vdata.vid}/${year}/`);
                        }
                        ldata = yield epona.queue(uris);
                        ldata.map(_data => {
                            Array.prototype.push.apply(vids, _data.ids);
                        });
                        uris = vids.map(vid => `http://mixer.video.iqiyi.com/jp/mixin/videos/${vid}/`);
                        pdata = yield epona.queue(uris);
                        pdata.map(_data => {
                            plays.push(_data.value);
                        });
                    }
                    break;
                case 3:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 13:
                case 17:
                case 21:
                case 22:
                case 24:
                case 25:
                case 26:
                case 27:
                case 28:
                case 29:
                case 30:
                case 31:
                case 32:
                    let uris;
                    if (film.show_type === 1) {
                        uris = [`http://cache.video.qiyi.com/jp/sdvlst/${vdata.cid}/${vdata.vid}/${film.year}/`];
                    }
                    else {
                        uri = `http://cache.video.iqiyi.com/jp/sdlst/${vdata.cid}/${vdata.vid}/`;
                        ldata = yield epona.queue(uri);
                        if (!ldata.years) {
                            uri = `http://cache.video.iqiyi.com/jp/avlist/${vdata.vid}/`;
                            ldata = yield epona.queue(uri);
                            episode = ldata.episode - 0;
                            if (ldata.ids && ldata.ids.length >= 1) {
                                vids = ldata.ids.slice(0, 1);
                                uri = `http://mixer.video.iqiyi.com/jp/mixin/videos/${vids[0]}/`;
                                pdata = yield epona.queue(uri);
                                plays.push(pdata.value);
                                break;
                            }
                        }
                        else {
                            uris = ldata.years.map(year => `http://cache.video.qiyi.com/jp/sdvlst/${vdata.cid}/${vdata.vid}/${year}/`);
                        }
                    }
                    ldata = yield epona.queue(uris);
                    ldata.map(_data => {
                        Array.prototype.push.apply(vids, _data.ids);
                    });
                    uris = vids.map(vid => `http://mixer.video.iqiyi.com/jp/mixin/videos/${vid}/`);
                    pdata = yield epona.queue(uris);
                    pdata.map(_data => {
                        plays.push(_data.value);
                    });
                    break;
                default:
                    console.error(`channel id ${vdata.cid} is error.`);
                    break;
            }
            return {
                vids,
                plays,
                episode: episode || plays.length,
            };
        }));
        let data = yield Promise.all(promises);
        return data[0];
    }
    catch (error) {
        console.error(error);
    }
});
exports.crawlIqiyi = crawlIqiyi;
let name_map = {
    '电影': '1',
    '电视剧': '2',
    '综艺': '6',
    '动漫': '4',
    '纪录片': '3',
    '网络电影': '16',
    '资讯': '25',
};
const searchIqiyi = (params) => __awaiter(this, void 0, void 0, function* () {
    try {
        let { type, year = 2017 } = params;
        let ntype = name_map[type];
        let page = 1;
        let uri = `http://list.iqiyi.com/www/${ntype}/-----------${year}--4-1-1---.html`;
        let pdata = yield epona.queue(uri);
        let { next = '', items = [] } = pdata;
        let videos = items;
        while (next.includes('下一页')) {
            ++page;
            uri = `http://list.iqiyi.com/www/${ntype}/-----------${year}--4-${page}-1---.html`;
            pdata = yield epona.queue(uri);
            let { items = [] } = pdata;
            videos = videos.concat(items);
            next = pdata.next || '';
        }
        videos = videos.map(x => {
            x.site = 'iqiyi';
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
exports.searchIqiyi = searchIqiyi;
