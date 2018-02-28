"use strict";
const utils_1 = require("./utils");
const lodash_1 = require("lodash");
const htmlparser = require("htmlparser2");
const css_select_1 = require("./css/css-select");
const recipe_1 = require("./parser/recipe");
const warpipe_1 = require("warpipe");
const serialize = require("dom-serializer");
let rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i;
let rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/;
let hasOwn = Object.prototype.hasOwnProperty;
exports.getCherry = (warpipe) => {
    class Cherry {
        constructor(html, recipes, opts = {}) {
            if (lodash_1.isString(html) && utils_1.isHtml(html)) {
                this._html = html;
            }
            if (lodash_1.isArray(html)) {
                this._root = html;
            }
            if (utils_1.isNode(html)) {
                this._root = [html];
            }
            if (recipes) {
                this._obj = this.toObj(recipes);
            }
            this.options = {};
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
        get filters() {
            return warpipe_1.filters;
        }
        find(selector) {
            return new Cherry(css_select_1.default(selector, this.root));
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
            if (name == "XRegExp") {
            }
            if (name == "text" || name == "text()") {
                return this.text();
            }
            if (name == "html" || name == "html()") {
                return this.html;
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
                let name, filters = '';
                if (lodash_1.isArray(attr)) {
                    [name, filters] = attr;
                }
                else {
                    name = attr;
                }
                let [xa, xn] = lodash_1.split(name, ':');
                attrs[xn || xa] = warpipe.exec((this.attr(xa) || null), filters);
                if (!xn && attrsRecipe.length == 1) {
                    return attrs[xa];
                }
            }
            return attrs;
        }
        nodes(nodesRecipe) {
            if (!nodesRecipe) {
                return;
            }
            let nodes = {};
            for (let name in nodesRecipe) {
                nodes[name] = this.extract(nodesRecipe[name]);
            }
            return nodes;
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
                return this._obj;
            }
        }
        toJSON() {
            return JSON.stringify(this.toObj(recipes));
        }
        extract(recipes) {
            let ret = [];
            if (!recipes.__compiled) {
                recipes = recipe_1.default.parse(recipes);
            }
            if (recipes.registerFilters) {
                warpipe.register(recipes.registerFilters);
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
                if (utils_1.isBlank(ret)) {
                    ret = recipes.default || null;
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
                nodes = this.nodes(recipe.nodes);
                return lodash_1.assign(attrs, nodes);
            }
            else {
                return attrs;
            }
        }
        extractHTML(recipe) {
            if (recipe.each) {
                let ret = this.find(recipe.sels).map((elem) => elem.extractItem(recipe));
                return warpipe.exec(ret, recipe.filters);
            }
            else {
                let elem = (recipe.sels == '' ? this : this.find(recipe.sels));
                return warpipe.exec(elem.extractItem(recipe), recipe.filters);
            }
        }
        each(fn) {
            this.root.map(function (elem, i) {
                return fn(new Cherry(elem), i);
            });
            return this;
        }
        map(fn) {
            return this.root.map(function (elem, i) {
                return fn(new Cherry(elem), i);
            });
        }
        static load(html) {
            return new this(html);
        }
    }
    return Cherry;
};
//# sourceMappingURL=cherry.js.map