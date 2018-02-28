"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const index_1 = require("../index");
const fs = require("fs");
let html = fs.readFileSync("./test/statics/index.html").toString();
let parsedBodyInline = index_1.korok(html, {
    extraClass: '.extra',
    articleid: '#zen-preamble',
    articleh4: 'h4',
    author: "meta[name=author]",
    title: "title",
    titleFilter: "title | camelCase",
    array: '.array *',
    arrayValue: '.array *::value',
    arrayValueFilter: '.array *::value|toNumber',
    arrayValueLte: '.array *::value|toNumber|lte(1)',
    arrayValueRename: '.array *::value:data',
    arraysattr: '#arrays::data',
    arraysattrs: '#arrays::data,type',
    arraysattrRename: '#arrays::data:array',
    arraysattrRenameFilter: '#arrays::data:array|toNumber',
    arraysattrsRename: '#arrays::data:array,type',
    selfsText: '.stext::selfsText()|trim'
}, { titleDefault: "pikiest_test" }, {});
let parsedBodyOpts = index_1.korok(html, {
    extraClass: { sels: '.extra' },
    articleid: { sels: '#zen-preamble' },
    articleh4: { sels: 'h4' },
    author: { sels: "meta[name=author]" },
    title: { sels: "title" },
    titleFilter: { sels: "title", filters: ['camelCase'] },
    array: { sels: '.array *' },
    arrayValue: { sels: '.array *', attrs: "value" },
    arrayValueFilter: { sels: '.array *', attrs: "value|toNumber" },
    arrayValueLte: { sels: '.array *', attrs: "value|toNumber|lte(1)" },
    arrayValueRename: { sels: '.array *', attrs: "value:data" },
    arraysattr: { sels: '#arrays', attrs: 'data' },
    arraysattrs: { sels: '#arrays', attrs: ['data', 'type'] },
    arraysattrRename: { sels: '#arrays', attrs: 'data:array' },
    arraysattrRenameFilter: { sels: '#arrays', attrs: 'data:array|toNumber' },
    arraysattrsRename: { sels: '#arrays', attrs: ['data:array', 'type'] },
    titleDefaultOpt: { sels: 'null', default: 'pikiest_test' },
    regParsed: {
        sels: /title="([\w\W]{3})"/,
        filters: function (x) {
            return x[1];
        }
    },
    xregParsed: index_1.re('(?x)(?<year>  [0-9]{4} ) -?  # year  \n\
                   (?<month> [0-9]{2} ) -?  # month \n\
                   (?<day>   [0-9]{2} )     # day   ', 'format("{month}/{day|numbers|double}/{year}")'),
    nestNode: {
        sels: '#arrays',
        nodes: {
            array: ".nest *",
            abc: "::data",
            abcs: {
                sels: "::data",
                filters: [(x) => parseInt(x)]
            },
            abcd: {
                sels: "::$",
                filters: [(x) => x.extract('.nest *')]
            }
        }
    },
}, { titleDefault: "pikiest_test" }, {});
let parsedBodyXpath = index_1.korok(html, {
    extraClass: '//*[@class="extra"]',
    articleid: '//*[@id="zen-preamble"]',
    articleh4: 'h4',
    author: "meta[name=author]",
    title: "title",
    titleFilter: "title | camelCase",
    array: '//*[@class="array"] *',
    arrayValue: '//*[@class="array"] *::value',
    arrayValueFilter: '//*[@class="array"] *::value|toNumber',
    arrayValueLte: '//*[@class="array"] *::value|toNumber|lte(1)',
    arrayValueRename: '//*[@class="array"] *::value:data',
    arraysattr: '//*[@id="arrays"]::data',
    arraysattrs: '//*[@id="arrays"]::data,type',
    arraysattrRename: '//*[@id="arrays"]::data:array',
    arraysattrRenameFilter: '//*[@id="arrays"]::data:array|toNumber',
    arraysattrsRename: '//*[@id="arrays"]::data:array,type'
}, { titleDefault: "pikiest_test" }, {});
function tests(parsedBody, func) {
    return function () {
        it('使用类选择器获取元素', function () {
            chai_1.expect(parsedBody.extraClass).to.be.equal("class selector");
        });
        it('使用 id 选择器获取元素', function () {
            chai_1.expect(parsedBody.articleid).to.be.equal("The Road to Enlightenment");
        });
        it('使用 html 标签选择器获取元素', function () {
            chai_1.expect(parsedBody.articleh4).to.be.equal("The Road to Enlightenment");
        });
        it('使用伪类选择器 [name=author]', function () {
            chai_1.expect(parsedBody.author).to.be.equal("Karma");
        });
        it('对一般元素默认执行 text() 方法', function () {
            chai_1.expect(parsedBody.title).to.be.equal("pikiest_test");
        });
        it('通过过滤器变成 camelCase', function () {
            chai_1.expect(parsedBody.titleFilter).to.be.equal("pikiestTest");
        });
        it('默认从 meta 取 content 属性', function () {
            chai_1.expect(parsedBody.author).to.be.equal("Karma");
        });
        it('选择多个元素并结成数组', function () {
            chai_1.expect(parsedBody.array).to.be.eql(['1', '2', '3']);
        });
        it('选择多个元素结成数组, 并取属性', function () {
            chai_1.expect(parsedBody.arrayValue).to.be.eql(["3", "2", "1"]);
        });
        it('选择多个元素结成数组取属性, 并将元素转化位数字', function () {
            chai_1.expect(parsedBody.arrayValueFilter).to.be.eql([3, 2, 1]);
        });
        it('选择多个元素结成数组取属性, 并判断是否小于2', function () {
            chai_1.expect(parsedBody.arrayValueLte).to.be.eql([false, false, true]);
        });
        it('选择多个元素结成数组, 取属性并重命名', function () {
            chai_1.expect(parsedBody.arrayValueRename).to.be.eql([
                { data: "3" },
                { data: "2" },
                { data: "1" },
            ]);
        });
        it('选择元素单个属性', function () {
            chai_1.expect(parsedBody.arraysattr).to.be.equal("123");
        });
        it('选择元素单个属性, 并重命名', function () {
            chai_1.expect(parsedBody.arraysattrRename).to.be.eql({ array: "123" });
        });
        it('选择元素单个属性重命名, 并转化为数字', function () {
            chai_1.expect(parsedBody.arraysattrRenameFilter).to.be.eql({ array: 123 });
        });
        it('选择元素多个属性', function () {
            chai_1.expect(parsedBody.arraysattrs).to.be.eql({ data: "123", type: "array" });
        });
        it('选择元素多个属性, 并重命名', function () {
            chai_1.expect(parsedBody.arraysattrsRename).to.be.eql({ array: "123", type: "array" });
        });
        it('全局默认值', function () {
            chai_1.expect(parsedBody.titleDefault).to.be.equal("pikiest_test");
        });
        if (func)
            (func());
    };
}
describe('解析 html 时通过内联方式,', tests(parsedBodyInline, function () {
    it('获取元素直接下级的 text', function () {
        chai_1.expect(parsedBodyInline.selfsText).to.be.equal("text");
    });
}));
describe('解析 html 时通过选项方式,', tests(parsedBodyOpts, function () {
    it('传递默认值', function () {
        chai_1.expect(parsedBodyOpts.titleDefaultOpt).to.be.equal("pikiest_test");
    });
    it('嵌套取值', function () {
        chai_1.expect(parsedBodyOpts.nestNode).to.be.eql({
            array: ['1', '2', '3'],
            abc: "123",
            abcs: 123,
            abcd: ['1', '2', '3']
        });
    });
    it('通过正则获取', function () {
        chai_1.expect(parsedBodyOpts.regParsed).to.be.equal("RSS");
    });
    it('获取 html 元素', function () {
        chai_1.expect(parsedBodyOpts.titleDefault).to.be.equal("pikiest_test");
    });
    it('获取 XRegExp 元素', function () {
        chai_1.expect(parsedBodyOpts.xregParsed).to.be.equal("03/6/2017");
    });
}));
describe('解析 html 时通过 xpath 选择器,', tests(parsedBodyXpath));
//# sourceMappingURL=html.js.map