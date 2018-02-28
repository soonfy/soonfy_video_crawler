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
    .on(['pptv.com/show/videoList'], {
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
const crawlAcfun = (films) => __awaiter(this, void 0, void 0, function* () {
    try {
        let promises = films.map((film) => __awaiter(this, void 0, void 0, function* () {
            let vdata = yield epona.queue(film.uri);
            console.log(vdata);
            let pdata, uri, vids = [], plays = [];
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
exports.crawlAcfun = crawlAcfun;
