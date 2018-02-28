"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const lodash_1 = require("lodash");
const htmlparser = require("htmlparser2");
const css_1 = require("./parser/css");
const recipe_1 = require("./parser/recipe");
const serialize = require("dom-serializer");
let rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i;
let rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/;
let hasOwn = Object.prototype.hasOwnProperty;
exports.korokFactory = (warpipe) => {
    class KorokPicker {
        constructor(html, opts = {}) {
            if (lodash_1.isString(html) && utils_1.isHtml(html)) {
                this._html = html;
            }
            if (lodash_1.isArray(html)) {
                this._root = html;
            }
            if (utils_1.isNode(html)) {
                this._root = [html];
            }
            this.options = opts;
            if (opts.json) {
                this.find = (recipe) => lodash_1.get(this.json, recipe.json);
            }
            else {
                this.find = (recipe) => new KorokPicker(css_1.selectAll(recipe.css, this.root));
            }
            return this;
        }
        get html() {
            return this._html || serialize(this.root);
        }
        set html(html) {
            return this._html = html;
        }
        set root(content) {
            this._root = htmlparser.parseDOM(content, this.options);
        }
        get root() {
            return this._root || (this._root = htmlparser.parseDOM(this._html, this.options));
        }
        get element() {
            return this.root[0];
        }
        filters(seed, filterStr) {
            if (!filterStr) {
                filterStr = seed, seed = this;
            }
            return warpipe.exec(seed, filterStr);
        }
        selfsText(elems, n) {
            let ret = '';
            elems = elems || this.root;
            for (let elem of elems) {
                if (elem.children && elem.type !== 'comment') {
                    let ary = [];
                    for (let cld of elem.children) {
                        if (cld.type === 'text') {
                            ary.push(cld.data);
                        }
                    }
                    ret = n ? nth(ary, n) : ary.join('');
                }
            }
            return ret;
        }
        text(elems) {
            let ret = '';
            elems = elems || this.root;
            for (let elem of elems) {
                if (elem.type === 'text') {
                    ret += elem.data;
                }
                else if (elem.children && elem.type !== 'comment') {
                    ret += this.text(elem.children);
                }
            }
            return ret;
        }
        attr(name) {
            let elem = this.element;
            if (!elem)
                return null;
            if (name == "$") {
                return this;
            }
            if (name == "text()") {
                return this.text();
            }
            if (name == "selfsText()") {
                return this.selfsText();
            }
            if (name == "html()") {
                return this.html;
            }
            if(name == "tag()") {
                return elem.name;
            }
            if (hasOwn.call(elem.attribs, lodash_1.toLower(name))) {
                return rboolean.test(name) ? name : elem.attribs[lodash_1.toLower(name)];
            }
            if (elem.name === 'option' && name === 'value') {
                return this.text(elem.children);
            }
            if (elem.name === 'input' &&
                (elem.attribs.type === 'radio' || elem.attribs.type === 'checkbox') &&
                name === 'value') {
                return 'on';
            }
        }
        attrs(attrsRecipe) {
            if (!attrsRecipe) {
                return;
            }
            let attrs = {};
            for (let attr of attrsRecipe) {
                attrs[attr.name || attr.attr] = warpipe.exec((this.attr(attr.attr) || null), attr.filters);
                if (!attr.name && attrsRecipe.length == 1) {
                    return attrs[attr.attr];
                }
            }
            return attrs;
        }
        toObj(recipes) {
            if (recipes) {
                let ret = {};
                for (let name in recipes) {
                    ret[name] = this.extract(recipes[name]);
                }
                return ret;
            }
            else {
                return {};
            }
        }
        toJson(recipes) {
            return JSON.stringify(this.toObj(recipes));
        }
        extract(recipes) {
            let ret = [];
            if (!recipes.__compiled) {
                recipes = recipe_1.default.parse(recipes);
            }
            if (recipes.context) {
                warpipe.register(recipes.context);
            }
            if (recipes.recipes) {
                for (let recipe of recipes.recipes) {
                    let line = this.extractLine(recipe);
                    if (utils_1.isBlank(line)) {
                        continue;
                    }
                    else if (line && recipes.join) {
                        ret.push(line);
                    }
                    else {
                        ret = line;
                        break;
                    }
                }
                ret = warpipe.exec(ret, recipes.filters);
                if (utils_1.isBlank(ret)) {
                    if (lodash_1.isFunction(recipes.default)) {
                        ret = recipes.default() || null;
                    }
                    else {
                        ret = recipes.default || null;
                    }
                }
            }
            else {
                console.log('Unhandled Recipes:', recipes);
            }
            return ret;
        }
        extractLine(recipe) {
            if (lodash_1.isString(recipe.sels)) {
                return this.extractHTML(recipe);
            }
            else if (lodash_1.isRegExp(recipe.sels)) {
                return warpipe.exec(this._html.match(recipe.sels), recipe.filters);
            }
            else if (!recipe.sels) {
                return null;
            }
            else {
                return this.extractFunc(recipe);
            }
        }
        extractFunc(recipe) {
            let ret = recipe.sels(this.html);
            return warpipe.exec(ret, recipe.filters);
        }
        extractItem(recipe) {
            let attrs, nodes;
            if (recipe.attrs) {
                attrs = this.attrs(recipe.attrs);
            }
            if (recipe.nodes) {
                nodes = this.toObj(recipe.nodes);
                return lodash_1.assign(attrs, nodes);
            }
            else {
                return attrs;
            }
        }
        extractHTML(recipe) {
            let elm = recipe.sels == '' ? this : this.find(recipe);
            if (recipe.each) {
                let ret = elm.map((e) => e.extractItem(recipe));
                return warpipe.exec(ret, recipe.filters);
            }
            else {
                return warpipe.exec(elm.extractItem(recipe), recipe.filters);
            }
        }
        each(fn) {
            this.root.map(function (elem, i) {
                return fn(new KorokPicker(elem), i);
            });
            return this;
        }
        map(fn) {
            return this.root.map(function (elem, i) {
                return fn(new KorokPicker(elem), i);
            });
        }
        static load(html) {
            return new this(html);
        }
    }
    return KorokPicker;
};
//# sourceMappingURL=korok_factory.js.map