"use strict";
const request_1 = require("./src/request");
const winston_1 = require("./src/winston");
const sortinghat_1 = require("./src/sortinghat");
const typhoeus_1 = require("./src/typhoeus");
const oneroute_1 = require("./src/oneroute");
const onable_1 = require("./src/onable");
const utils_1 = require("./src/utils");
const lodash_1 = require("lodash");
function isNeededIterators(baseUrl) {
    let url = baseUrl.url || baseUrl;
    let matched = url.match(/{.+?}/g);
    return matched && !matched.map(x => lodash_1.includes(x, '..')).reduce((x, y) => { return x && y; }, true);
}
function iterator(url, iterators) {
    let urls, acquire;
    let wrapUrl = x => x.url ? x : { url: x };
    if (lodash_1.isPlainObject(url)) {
        urls = utils_1.iterateUrls(url.url, iterators);
        wrapUrl = x => { let ret = lodash_1.clone(url); ret.url = x; return ret; };
    }
    else if (lodash_1.isString(url)) {
        urls = utils_1.iterateUrls(url, iterators);
    }
    else {
        urls = url;
    }
    urls = lodash_1.isArray(urls) ? urls.map(wrapUrl) : wrapUrl(urls);
    return urls;
}
class Epona {
    constructor(opts = {}) {
        this.crawledLinks = [];
        this.request = request_1.default;
    }
    queue(urls, opts) {
        let wrapUrl = x => x.url ? x : { url: x };
        urls = lodash_1.isArray(urls) ? urls.map(wrapUrl) : wrapUrl(urls);
        return this.throttle.queue(urls, opts);
    }
    on(patterns, recipe, opts = {}) {
        opts.filters = {
            follow: (urls) => { this.queue(urls); return urls; },
            followAndWait: (urls) => this.queue(urls)
        };
        let onable = new onable_1.Onable(this, patterns, recipe, opts);
        return onable;
    }
    parse(item) {
        return this.dispatcher.parse(item);
    }
    use(fn, opts) {
        fn(this, opts);
        return this;
    }
    get(url, iterators, opts) {
        let urls = iterator(url, iterators);
        return this.throttle.queue(urls, opts);
    }
    follow() {
    }
    defaults() {
        request_1.default.defaults.apply(request_1.default, arguments);
        return this;
    }
    enableCookie() {
    }
    static new(opts = {}) {
        let epona = new Epona(opts);
        epona.use(winston_1.default, opts);
        epona.use(sortinghat_1.default, opts);
        epona.use(typhoeus_1.default, opts);
        return epona;
    }
    static dummy(recipe, opts) {
        let epona = new Epona(opts);
        epona.use(winston_1.default, opts);
        epona.use(typhoeus_1.default, opts);
        epona.use(oneroute_1.default, opts);
        return new onable_1.Onable(epona, "*", recipe, opts);
    }
    static get(url, iterators, recipe, opts) {
        if (lodash_1.isArray(url) || !isNeededIterators(url)) {
            opts = recipe, recipe = iterators;
        }
        let dummy = this.dummy(recipe, opts);
        if (Proxy) {
            let proxy = new Proxy(dummy, {
                get: function (target, name) {
                    if (name === 'then') {
                        let pms = target.epona.get(url, iterators, opts);
                        return pms.then.bind(pms);
                    }
                    return dummy[name];
                }
            });
            return proxy;
        }
        else {
            return dummy.epona.get(url, iterators, opts);
        }
    }
}
Epona.request = request_1.default;
module.exports = Epona;
//# sourceMappingURL=index.js.map