"use strict";
const lodash_1 = require("lodash");
exports.isBlank = (el) => {
    if (lodash_1.isString(el)) {
        return el.length == 0;
    }
    else if (lodash_1.isNumber(el)) {
        return false;
    }
    else {
        return lodash_1.isEmpty(el);
    }
};
const expand = require("expand-range");
function onlyOneQuery(baseUrl) {
    return lodash_1.uniq(baseUrl.match(/\${.+?}/g)).length == 1;
}
function makeUrls(baseUrl, iterators, context) {
    for (let i in iterators) {
        let iterator = iterators[i];
        let urls = iterator.iterator.map(it => baseUrl.replace(iterator.placeholder, it));
        iterators = lodash_1.omit(iterators, i);
        if (lodash_1.keys(iterators).length == 0) {
            return urls;
        }
        else {
            return urls.map(url => makeUrls(url, iterators, context));
        }
    }
}
exports.iterateUrls = (baseUrl, context) => {
    let iterators = (baseUrl.match(/{.+?}/g) || []).map(x => x.replace(/[{}]/g, ''));
    if (iterators.length == 0) {
        return baseUrl;
    }
    let _iterators = [], _iteratobjs = {};
    for (let i in iterators) {
        let iterator = iterators[i];
        if (lodash_1.includes(iterator, '.')) {
            iterator = expand(iterator);
        }
        else {
            iterator = context[iterator];
        }
        if (!lodash_1.isObject(iterator)) {
            iterator = [iterator];
        }
        _iteratobjs[lodash_1.toString(i)] = {
            placeholder: "{" + iterators[i] + "}",
            iterator,
        };
    }
    return lodash_1.flattenDeep(makeUrls(baseUrl, _iteratobjs, context));
};
//# sourceMappingURL=utils.js.map