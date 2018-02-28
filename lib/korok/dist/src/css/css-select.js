"use strict";
const DomUtils = require("domutils");
const boolbase_1 = require("boolbase");
const compileFactory = require("css-select/lib/compile");
exports.compile = compileFactory(DomUtils);
exports.filters = exports.compile.Pseudos.filters;
exports.pseudos = exports.compile.Pseudos.pseudos;
function adapterCompile(adapter) {
    return adapter === DomUtils ? exports.compile : compileFactory(adapter);
}
function getSelectorFunc(searchFunc) {
    return function select(query, elems, options) {
        options = options || {};
        options.adapter = options.adapter || DomUtils;
        let compile = adapterCompile(options.adapter);
        if (typeof query !== "function")
            query = compile.compileUnsafe(query, options, elems);
        if (query.shouldTestNextSiblings)
            elems = appendNextSiblings((options && options.context) || elems, options.adapter);
        if (!Array.isArray(elems))
            elems = options.adapter.getChildren(elems);
        else
            elems = options.adapter.removeSubsets(elems);
        return searchFunc(query, elems, options);
    };
}
function getNextSiblings(elem, adapter) {
    let siblings = adapter.getSiblings(elem);
    if (!Array.isArray(siblings))
        return [];
    siblings = siblings.slice(0);
    while (siblings.shift() !== elem)
        ;
    return siblings;
}
function appendNextSiblings(elems, adapter) {
    if (!Array.isArray(elems))
        elems = [elems];
    let newElems = elems.slice(0);
    for (let i = 0, len = elems.length; i < len; i++) {
        let nextSiblings = getNextSiblings(newElems[i], adapter);
        newElems.push.apply(newElems, nextSiblings);
    }
    return newElems;
}
exports.selectAll = getSelectorFunc(function selectAll(query, elems, options) {
    return (query === boolbase_1.falseFunc || !elems || elems.length === 0) ? [] : options.adapter.findAll(query, elems);
});
exports.selectOne = getSelectorFunc(function selectOne(query, elems, options) {
    return (query === boolbase_1.falseFunc || !elems || elems.length === 0) ? null : options.adapter.findOne(query, elems);
});
function is(elem, query, options) {
    options = options || {};
    options.adapter = options.adapter || DomUtils;
    let compile = adapterCompile(options.adapter);
    return (typeof query === "function" ? query : compile(query, options))(elem);
}
exports.is = is;
function CSSselect(query, elems, options) {
    return exports.selectAll(query, elems, options);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CSSselect;
//# sourceMappingURL=css-select.js.map