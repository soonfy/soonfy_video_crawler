"use strict";
const chai_1 = require("chai");
const index_1 = require("../index");
let warpipeo = new index_1.Warpipe;
describe('parse and exec filters,', function () {
    it('default filters', function () {
        chai_1.expect(index_1.warpipe("/2012/08/12/test.html", 'extract("/{year}/{month}/{day}/{title}.html")')).to.be.eql({
            year: '2012', month: '08', day: '12', title: 'test'
        });
    });
    it('with default filters', function () {
        chai_1.expect(index_1.warpipe([1, 2, 3], 'reverse | nth(2)')).to.be.equal(1);
    });
    it('with custom filters', function () {
        chai_1.expect(index_1.warpipe([1, 2, 3], 'reverse | nth(2)| double', {
            double: (x) => x * 2
        })).to.be.equal(2);
    });
    it('default filters(new Warpipe)', function () {
        chai_1.expect(warpipeo.exec("/2012/08/12/test.html", 'extract("/{year}/{month}/{day}/{title}.html")')).to.be.eql({
            year: '2012', month: '08', day: '12', title: 'test'
        });
    });
    it('with default filters(new Warpipe)', function () {
        chai_1.expect(warpipeo.exec([1, 2, 3], 'reverse | nth(2)')).to.be.equal(1);
    });
    it('with custom filters(new Warpipe)', function () {
        chai_1.expect(warpipeo.exec([1, 2, 3], 'reverse | nth(2)| double', {
            double: (x) => x * 2
        })).to.be.equal(2);
    });
    warpipeo.register({
        trible: (x) => x * 3
    });
    it('with register filters(new Warpipe)', function () {
        chai_1.expect(warpipeo.exec([1, 2, 3], 'reverse | nth(2)| trible')).to.be.equal(3);
    });
    index_1.registerWarpipes(({
        absAndDouble: (x) => Math.abs(x) * 2
    }));
    it('with register user filters(new Warpipe)', function () {
        chai_1.expect(warpipeo.exec([-1, -2, -3], 'reverse | nth(2)| absAndDouble')).to.be.equal(2);
    });
});
//# sourceMappingURL=index.js.map