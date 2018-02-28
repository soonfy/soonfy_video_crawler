"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DomUtils = require("domutils");
const boolbase_1 = require("boolbase");
const compileFactory = require("css-select/lib/compile");
exports.compile = compileFactory(DomUtils);
exports.filters = exports.compile.Pseudos.filters;
exports.pseudos = exports.compile.Pseudos.pseudos;
exports.compile.compileUnsafe = function (selector, options, context) {
    return exports.compile.compileToken(selector, options, context);
};
function getSelectorFunc(searchFunc) {
    return (query, elems, options) => {
        options = options || {};
        if (typeof query !== "function") {
            query = exports.compile.compileUnsafe(query, options, elems);
        }
        if (query.shouldTestNextSiblings) {
            elems = appendNextSiblings((options && options.context) || elems);
        }
        if (!Array.isArray(elems)) {
            elems = DomUtils.getChildren(elems);
        }
        else {
            elems = DomUtils.removeSubsets(elems);
        }
        return searchFunc(query, elems, options);
    };
}
function getNextSiblings(elem) {
    let siblings = DomUtils.getSiblings(elem);
    if (!Array.isArray(siblings))
        return [];
    siblings = siblings.slice(0);
    while (siblings.shift() !== elem)
        return siblings;
}
function appendNextSiblings(elems) {
    if (!Array.isArray(elems))
        elems = [elems];
    let newElems = elems.slice(0);
    for (let i = 0, len = elems.length; i < len; i++) {
        let nextSiblings = getNextSiblings(newElems[i]);
        newElems.push.apply(newElems, nextSiblings);
    }
    return newElems;
}
exports.selectAll = getSelectorFunc((query, elems, options) => {
    return (query === boolbase_1.falseFunc || !elems || elems.length === 0)
        ? []
        : DomUtils.findAll(query, elems);
});
exports.selectOne = getSelectorFunc((query, elems, options) => {
    return (query === boolbase_1.falseFunc || !elems || elems.length === 0)
        ? null
        : DomUtils.findOne(query, elems);
});
//# sourceMappingURL=css.js.map