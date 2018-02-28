"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const korok_factory_1 = require("./src/korok_factory");
const utils_1 = require("./src/utils");
const lodash_1 = require("lodash");
const warpipe_1 = require("warpipe");
const json2xml_1 = require("./src/parser/json2xml");
const recipe_1 = require("./src/parser/recipe");
const filters_1 = require("./src/filters");
const XRegExp = require("xregexp");
warpipe_1.registerWarpipes(filters_1.default);
class Korok {
    constructor(recipes, opts) {
        this.recipes = recipes;
        this.parsedRecipes = {};
        if (lodash_1.isFunction(recipes)) {
            this.recipeFunc = recipes;
        }
        else if (recipes) {
            for (let name in recipes) {
                this.parsedRecipes[name] = recipe_1.default.parse(recipes[name]);
            }
        }
        this.options = opts;
        this.KorokPicker = korok_factory_1.korokFactory(new warpipe_1.Warpipe(opts.context));
    }
    pick(body, defaults, opts) {
        switch (opts.format) {
            case 'raw':
                break;
            case 'json':
                body = JSON.parse(body);
                break;
            case 'json:xml':
                body = json2xml_1.Json2Xml.parse(body);
                break;
            default:
                if (body.match(/^\s*{/)) {
                    body = json2xml_1.Json2Xml.parse(body);
                }
        }
        if (this.recipeFunc) {
            return lodash_1.defaultsDeep(this.recipeFunc(body), defaults);
        }
        if (utils_1.isBlank(this.parsedRecipes)) {
            if (opts.format == "raw" || opts.format == "json") {
                return body;
            }
            return new this.KorokPicker(body, opts);
        }
        else {
            let parsedBody = new this.KorokPicker(body, opts).toObj(this.parsedRecipes);
            return lodash_1.defaultsDeep(parsedBody, defaults);
        }
    }
}
exports.Korok = Korok;
function korok(body, recipes, defaults, opts = {}) {
    if (lodash_1.isString(recipes)) {
        let korok = new Korok({ result: recipes }, opts);
        return korok.pick(body, defaults, opts).result;
    }
    else {
        let korok = new Korok(recipes, opts);
        return korok.pick(body, defaults, opts);
    }
}
exports.korok = korok;
function registeFilters(filters, func) {
    return registeWarpipes(filters, func);
}
exports.registeFilters = registeFilters;
function re(regexp, filters) {
    if (lodash_1.isArray(regexp)) {
        let sels = function (text) {
            return XRegExp.matchChain(text, regexp);
        };
        return { sels, filters };
    }
    else {
        let sels = function (text) {
            return XRegExp.exec(text, XRegExp(regexp));
        };
        return { sels, filters };
    }
}
exports.re = re;
//# sourceMappingURL=index.js.map