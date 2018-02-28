"use strict";
const eval_1 = require("./src/eval");
const filters_1 = require("./src/filters");
const parser_1 = require("./src/parser");
const lodash_1 = require("lodash");
let userFilters = {};
exports.warpipe = function (seed, filtersString, context) {
    let compiledFilters = parser_1.parseFilters('__msg | ' + filtersString);
    if (!context) {
        context = {};
    }
    context.__msg = seed;
    lodash_1.defaults(context, userFilters);
    return eval_1.safeEval(compiledFilters, context);
};
exports.registerWarpipes = function (filters, func) {
    if (lodash_1.isPlainObject(filters)) {
        lodash_1.assign(userFilters, filters);
    }
    else if (lodash_1.isString(filters) && lodash_1.isFunction(func)) {
        userFilters[filters] = func;
    }
    return userFilters;
};
class Warpipe {
    constructor(context) {
        this._context = {};
        if (context) {
            this.context(context);
        }
    }
    register(key, val) {
        if (!key)
            return;
        if (lodash_1.isPlainObject(key)) {
            this._context = lodash_1.assign(this._context, key);
        }
        else {
            this._context[key] = val;
        }
        return this;
    }
    exec(seed, filtersString, context) {
        let compiledFilters = parser_1.parseFilters('__msg | ' + filtersString);
        if (!filtersString || filtersString == "") {
            return seed;
        }
        if (!context) {
            context = {};
        }
        context = lodash_1.defaults(context, userFilters, this._context);
        context.__msg = seed;
        return eval_1.safeEval(compiledFilters, context);
    }
}
exports.Warpipe = Warpipe;
exports.filters = filters_1.default;
//# sourceMappingURL=index.js.map