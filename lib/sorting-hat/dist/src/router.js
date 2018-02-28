"use strict";
const lodash_1 = require("lodash");
const signals_1 = require("./signals");
class Router {
    constructor(pattern, callback, prioity, router) {
        let isRegexPattern = lodash_1.isRegExp(pattern);
        let lexer = router.lexer;
        this.router = router;
        this.pattern = pattern;
        if (lodash_1.isRegExp(pattern)) {
            this.matchRegexp = pattern;
        }
        else if (lodash_1.isFunction(pattern)) {
            this.matchFunc = pattern;
        }
        else {
            this.paramsIds = lexer.getParamIds(pattern);
            this.optionalParamsIds = lexer.getOptionalParamsIds(pattern);
            this.matchRegexp = lexer.compilePattern(pattern, router.ignoreCase);
        }
        this.matched = new signals_1.default();
        this.switched = new signals_1.default();
        this.paramsIds = isRegexPattern ? null : lexer.getParamIds(pattern);
        if (callback) {
            this.matched.add(callback);
        }
        this.prioity = prioity || 0;
        this.greedy = false;
        this.rules = null;
    }
    match(request) {
        request = request || '';
        if (this.matchFunc) {
            return this.matchFunc(request);
        }
        else {
            return this.matchRegexp.test(request) && this.validateParams(request);
        }
    }
    validateParams(request) {
        let rules = this.rules;
        let values = this.getParamsObject(request);
        let key;
        for (key in rules) {
            if (key !== 'normalize_' && rules.hasOwnProperty(key) && !this.isValidParam(request, key, values)) {
                return false;
            }
        }
        return true;
    }
    isValidParam(request, prop, values) {
        let validationRule = this.rules[prop];
        let val = values[prop];
        let isValid = false;
        let isQuery = (prop.indexOf('?') === 0);
        if (val == null && this.optionalParamsIds && arrayIndexOf(this.optionalParamsIds, prop) !== -1) {
            isValid = true;
        }
        else if (lodash_1.isRegExp(validationRule)) {
            if (isQuery) {
                val = values[prop + '_'];
            }
            isValid = validationRule.test(val);
        }
        else if (lodash_1.isArray(validationRule)) {
            if (isQuery) {
                val = values[prop + '_'];
            }
            isValid = this._isValidArrayRule(validationRule, val);
        }
        else if (lodash_1.isFunction(validationRule)) {
            isValid = validationRule(val, request, values);
        }
        return isValid;
    }
    isValidArrayRule(arr, val) {
        if (!this.router.ignoreCase) {
            return arrayIndexOf(arr, val) !== -1;
        }
        if (typeof val === 'string') {
            val = val.toLowerCase();
        }
        let n = arr.length, item, compareVal;
        while (n--) {
            item = arr[n];
            compareVal = (typeof item === 'string') ? item.toLowerCase() : item;
            if (compareVal === val) {
                return true;
            }
        }
        return false;
    }
    getParamsObject(request) {
        if (this.matchFunc) {
            return {
                request_: shouldTypecast ? typecastValue(request) : request,
                vals_: { values }
            };
        }
        let shouldTypecast = this.router.shouldTypecast, values = this.router.lexer.getParamValues(request, this.matchRegexp, shouldTypecast), o = {}, n = values.length, param, val;
        while (n--) {
            val = values[n];
            if (this._paramsIds) {
                param = this._paramsIds[n];
                if (param.indexOf('?') === 0 && val) {
                    o[param + '_'] = val;
                    val = decodeQueryString(val, shouldTypecast);
                    values[n] = val;
                }
                if (_hasOptionalGroupBug && val === '' && arrayIndexOf(this._optionalParamsIds, param) !== -1) {
                    val = void (0);
                    values[n] = val;
                }
                o[param] = val;
            }
            o[n] = val;
        }
        o.request_ = shouldTypecast ? typecastValue(request) : request;
        o.vals_ = values;
        return o;
    }
    getParamsArray(request) {
        var norm = this.rules ? this.rules.normalize_ : null, params;
        norm = norm || this.router.normalizeFn;
        if (norm && lodash_1.isFunction(norm)) {
            params = norm(request, this.getParamsObject(request));
        }
        else {
            params = this.getParamsObject(request).vals_;
        }
        return params;
    }
    interpolate(replacements) {
        var str = this.router.lexer.interpolate(this.pattern, replacements);
        if (!this.validateParams(str)) {
            throw new Error('Generated string doesn\'t validate against `Route.rules`.');
        }
        return str;
    }
    dispose() {
        this.router.removeRoute(this);
    }
    destroy() {
        this.matched.dispose();
        this.switched.dispose();
        this.matched = this.switched = this.pattern = this.matchRegexp = null;
    }
    toString() {
        return '[Route pattern:"' + this.pattern + '", numListeners:' + this.matched.getNumListeners() + ']';
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Router;
//# sourceMappingURL=router.js.map