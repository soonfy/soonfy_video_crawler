"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const utils_1 = require("../utils");
const selector_1 = require("./selector");
const xpath_1 = require("./xpath");
const csswhat = require("css-what");
function parseSelector(selector, attrs, nodes) {
    let sels, exps, filters = '', each = false;
    [sels, exps] = selector.split('::');
    sels = lodash_1.trim(sels);
    exps = lodash_1.trim(exps);
    attrs = attrs ? parseAttrs(attrs) : [];
    if (exps) {
        attrs = selector_1.parseFilters(exps);
    }
    else {
        let fi = selector.lastIndexOf('|');
        if (fi >= 0) {
            let fin = selector.lastIndexOf('|=');
            if (fin != fi) {
                fi = selector.indexOf('|');
                sels = selector.slice(0, fi);
                filters = selector.slice(fi + 1, selector.length);
            }
        }
    }
    if (lodash_1.endsWith(sels, ' *')) {
        sels = sels.slice(0, sels.length - 2);
        each = true;
    }
    if (lodash_1.startsWith(sels, '/')) {
        sels = xpath_1.xPathToCss(sels);
    }
    if (attrs.length == 0 && !nodes) {
        let matched = (filters).match(/^\$\s*[\|]?/);
        if (matched) {
            attrs.push("$");
            filters = filters.replace(matched[0], '');
        }
        else {
            attrs = defaultAttr(sels);
        }
    }
    return { sels, attrs, filters, each, css: csswhat(sels), nodes };
}
function parseAttrs(attrs) {
    if (lodash_1.isString(attrs)) {
        return selector_1.parseFilters(attrs);
    }
    else if (lodash_1.isArray(attrs)) {
        return lodash_1.flatten(attrs.map(selector_1.parseFilters));
    }
    else if (lodash_1.isPlainObject(attrs)) {
        let parsedAttrs = {};
        for (let child in attrs) {
            parsedAttrs[child] = Recipe.parse(attrs[child]);
        }
        return parsedAttrs;
    }
}
function defaultAttr(sels) {
    if (sels == 'a' || sels == "link") {
        return [{ attr: "href" }];
    }
    else if (lodash_1.includes(sels, 'meta')) {
        return [{ attr: "content" }];
    }
    else if (lodash_1.isFunction(sels)) {
        return [];
    }
    else {
        return [{ attr: "text()" }];
    }
}
function makeFilterName(func) {
    return ("_func_" + utils_1.crc32(func.toString()).toString(16)).replace('-', '_');
}
class Recipe {
    constructor(recipe) {
        this._recipe = recipe;
        this._compiledRecipe = Recipe.parse(recipe);
    }
    static parse(recipes) {
        let compiledRecipes;
        let attrs, filters = '', selectors, context = {}, nodes, join, flatten;
        if (lodash_1.isPlainObject(recipes)) {
            attrs = recipes.attrs;
            if (recipes.nodes) {
                nodes = {};
                for (let node in recipes.nodes) {
                    nodes[node] = Recipe.parse(recipes.nodes[node]);
                }
            }
            filters = recipes.filters || filters;
            selectors = recipes.sels;
            join = recipes.join;
            flatten = recipes.flatten;
        }
        else {
            selectors = recipes;
        }
        if (!lodash_1.isString(filters)) {
            filters = lodash_1.castArray(filters).map(filter => {
                if (lodash_1.isFunction(filter)) {
                    let filterName = makeFilterName(filter);
                    context[filterName] = filter;
                    return filterName;
                }
                return filter;
            }).join('|');
        }
        selectors = lodash_1.castArray(selectors);
        selectors = selectors.map((selector) => {
            let parsedSelector;
            if (lodash_1.isString(selector)) {
                parsedSelector = parseSelector(selector, attrs, nodes);
            }
            else {
                parsedSelector = { sels: selector };
            }
            return parsedSelector;
        });
        return {
            __compiled: true,
            default: recipes.default || null,
            filters: filters || '',
            context, join, flatten,
            recipes: selectors
        };
    }
}
exports.default = Recipe;
//# sourceMappingURL=recipe.js.map