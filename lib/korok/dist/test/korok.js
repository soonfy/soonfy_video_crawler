"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const korok_factory_1 = require("../src/korok_factory");
const fs = require("fs");
const warpipe_1 = require("warpipe");
let warpipe = new warpipe_1.Warpipe();
let Korok = korok_factory_1.korokFactory(warpipe);
let html = fs.readFileSync("./test/statics/index.html").toString();
let $ = new Korok(html);
describe('parse html file,', function () {
    it('extract by universal', function () {
        chai_1.expect($.extract('title*')).to.be.equal("pikiest_test");
    });
    it('extract by tag name', function () {
        chai_1.expect($.extract('title')).to.be.equal("pikiest_test");
    });
    it('extract by descendant', function () {
        chai_1.expect($.extract('head title')).to.be.equal("pikiest_test");
    });
    it('extract by child', function () {
        chai_1.expect($.extract('#arrays>span')).to.be.equal("123");
    });
    it('extract by parent', function () {
        chai_1.expect($.extract('.array<span::type')).to.be.equal("array");
    });
    it('extract by parent', function () {
        chai_1.expect($.extract('.array<span::type')).to.be.equal("array");
    });
    it('extract by sibling', function () {
        chai_1.expect($.extract('#zen-preamble + #arrays::type')).to.be.equal("array");
    });
    it('extract by adjacent', function () {
        chai_1.expect($.extract('#zen-preamble ~::type')).to.be.equal("array");
    });
    it('extract by adjacent', function () {
        chai_1.expect($.extract('#zen-preamble ~::type')).to.be.equal("array");
    });
    it('extract by attribute with fullmatch', function () {
        chai_1.expect($.extract('meta[name=author]')).to.be.equal("Karma");
    });
    it('extract by attribute includes(*=)', function () {
        chai_1.expect($.extract('meta[name*="th"]')).to.be.equal("Karma");
    });
    it('extract by attribute (|=)', function () {
        chai_1.expect($.extract('meta[name|="description"]')).to.be.equal("description");
    });
    it('extract by attribute starts with(^=)', function () {
        chai_1.expect($.extract('meta[name^="aut"]')).to.be.equal("Karma");
    });
    it('extract by attribute ends with($=)', function () {
        chai_1.expect($.extract('meta[name$="thor"]')).to.be.equal("Karma");
    });
    it('extract by pseudos :not', function () {
        chai_1.expect($.extract('span:not(.nest)::data')).to.be.equal("123");
    });
    it('extract by pseudos :contains', function () {
        chai_1.expect($.extract('span:contains(3)::data')).to.be.equal("123");
    });
    it('extract by pseudos :has', function () {
        chai_1.expect($.extract('span:has(.nest)|trimAll')).to.be.equal("123");
    });
    it('extract by pseudos :empty', function () {
        chai_1.expect($.extract('span:empty::value')).to.be.equal("5");
    });
    it('extract by pseudos :nth-child', function () {
        chai_1.expect($.extract('span:first-child::value')).to.be.equal("3");
    });
    it('extract by pseudos :nth-of-type', function () {
        chai_1.expect($.extract('.array:nth-of-type(1)')).to.be.equal("1");
    });
});
//# sourceMappingURL=korok.js.map