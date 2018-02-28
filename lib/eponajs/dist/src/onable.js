"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const korok_1 = require("korok");
const lodash_1 = require("lodash");
global.re = korok_1.re;
class Onable {
    constructor(epona, patterns, recipe, opts = {}) {
        this.patterns = lodash_1.castArray(patterns);
        this._recipe = recipe;
        this._opts = opts || recipe.opts;
        this._requestOpts = {};
        this._then = function (response) { return response; };
        this._catch = function (error, item) { console.log(error); };
        this._filters = [];
        this.epona = epona;
        this.crawled = [];
        this.resolved = [];
        this.catched = [];
        let self = this;
        let pick;
        if (lodash_1.isString(recipe) && recipe.length > 0) {
            let korok = new korok_1.Korok({ result: recipe }, opts);
            pick = (body, item) => korok.pick(body, lodash_1.defaults(item.default, this._default), this._opts).result;
        }
        else {
            let korok = new korok_1.Korok(recipe, opts);
            pick = (body, item) => {
                item.extract = function (recipe) {
                    if (!item._korok) {
                        item._body = korok.normalize(body, opts.format);
                        item._korok = korok.createPicker(item._body, self._opts);
                    }
                    return item._korok();
                };
                return korok.pick(body, lodash_1.defaults(item.default, this._default), this._opts);
            };
        }
        let pickfollow = (body) => {
        };
        let acquire = (item) => __awaiter(this, void 0, void 0, function* () {
            epona.logger.info("request ->", this.wrapUrl(item).url);
            let response = yield epona.request(this.wrapUrl(item));
            let body = this._beforeParse ? this._beforeParse(response.text, response) : response.text;
            pickfollow(body);
            item.response = response;
            return pick(body, item);
        });
        for (let pattern of this.patterns) {
            epona.dispatcher.on(pattern, function (action) {
                if (action == 'acquire') {
                    return acquire;
                }
                else if (action == 'release') {
                    let args = arguments;
                    return function (ret) {
                        args['0'] = ret;
                        return self._then.apply(self, args);
                    };
                }
                else {
                    return self;
                }
            });
        }
        return this;
    }
    wrapUrl(item) {
        if (this._host && item.url.indexOf('http') != 0) {
            item.url = this._host + item.url;
        }
        return lodash_1.defaultsDeep(item, this._requestOpts);
    }
    beforeParse(fn) {
        this._beforeParse = fn;
        return this;
    }
    then(fn) {
        this._then = fn;
        return this;
    }
    ['catch'](fn) {
        this._catch = fn;
        return this;
    }
    set(key, val) {
        if (lodash_1.isPlainObject(key)) {
            this._requestOpts = lodash_1.defaultsDeep(key, this._requestOpts);
        }
        else {
            this._requestOpts[key] = val;
        }
        return this;
    }
    headers(cookie) {
        if (!this._requestOpts.headers) {
            this._requestOpts.headers = {};
        }
        if (lodash_1.isPlainObject(key)) {
            this._defaults.headers = lodash_1.defaults(key, this._defaults.headers);
        }
        else {
            this._defaults.headers[key] = val;
        }
        return this;
    }
    cookie(cookie) {
        if (!this._requestOpts.headers) {
            this._requestOpts.headers = {};
        }
        this._requestOpts.headers.cookie = cookie;
        return this;
    }
    type(type) {
        this._opts.format = type;
        return this;
    }
    host(host) {
        this._host = host;
        this.epona.request.defaults({ baseUrl: host });
        return this;
    }
    defaults(key, val) {
        if (lodash_1.isPlainObject(key)) {
            this._defaults = lodash_1.defaults(key, this._defaults);
        }
        else {
            this._defaults[key] = val;
        }
        return this;
    }
    proxy() {
    }
    follow(opts) {
        let followReciep = {};
        opts.tags = opts.tags ? lodash_1.castArray(opts.tags).map(x => x + ' *') : 'a *';
        followReciep.links = {
            sels: opts.tags,
            attrs: opts.attrs || 'href',
        };
        this._follow.allow = opts.allow;
        this._follow.deny = opts.deny;
        this._follow.recipe = opts.followReciep;
        return this;
    }
    pipe() {
    }
    request() {
    }
    get() {
    }
}
exports.Onable = Onable;
//# sourceMappingURL=onable.js.map