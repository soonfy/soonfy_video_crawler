"use strict";
const _ = require("lodash");
const extract = require("extract-values");
const string_format_1 = require("./string_format");
const lodash_1 = require("./lodash");
let numbers = (ret, dft = null) => {
    return (ret || ret == '') ? _.toNumber((ret || '').replace(/[^\d]/g, '')) : dft;
};
let trimAll = (text) => {
    if (!text) {
        return "";
    }
    text = text.replace('&nbsp;', '');
    return text.replace(/[\s]+/g, "");
};
let second = (array) => array[1];
let third = (array) => array[1];
let print = () => console.log.apply(console, arguments);
let format = (obj, str) => string_format_1.stringFormat(str)(obj);
let double = (x) => x * 2;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = _.defaults({
    numbers,
    trimAll,
    second,
    third,
    print,
    extract,
    format,
    double
}, lodash_1.default);
//# sourceMappingURL=filters.js.map