import { expect } from 'chai'
import { korok, re } from "../index"
import * as fs from "fs"
let html = fs.readFileSync("./test/statics/index.html").toString()

let parsedBodyInline = korok(html, {
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
}, {titleDefault: "pikiest_test"}, {})

let parsedBodyOpts = korok(html, {
  extraClass: { sels: '.extra' },
  articleid: { sels: '#zen-preamble' },
  articleh4: { sels: 'h4' },
  author: { sels: "meta[name=author]" },
  title: { sels: "title" },
  titleFilter: {sels: "title", filters: ['camelCase'] },
  array: { sels: '.array *' },
  arrayValue: { sels: '.array *', attrs: "value" },
  arrayValueFilter: { sels: '.array *', attrs: "value|toNumber" },
  arrayValueLte: { sels: '.array *', attrs: "value|toNumber|lte(1)" },
  arrayValueRename: { sels: '.array *', attrs: "value:data" },
  arraysattr:  { sels: '#arrays', attrs: 'data' },
  arraysattrs: { sels: '#arrays', attrs: ['data', 'type'] },
  arraysattrRename: { sels: '#arrays', attrs: 'data:array' },
  arraysattrRenameFilter: { sels: '#arrays', attrs: 'data:array|toNumber' },
  arraysattrsRename: { sels: '#arrays', attrs: ['data:array', 'type'] },
  titleDefaultOpt: {sels: 'null', default: 'pikiest_test'},
  regParsed: {
    sels: /title="([\w\W]{3})"/,
    filters: function(x) {
      return x[1]
    }
  },
  xregParsed: re( '(?x)(?<year>  [0-9]{4} ) -?  # year  \n\
                   (?<month> [0-9]{2} ) -?  # month \n\
                   (?<day>   [0-9]{2} )     # day   '
                , 'format("{month}/{day|numbers|double}/{year}")'),
  nestNode: {
    sels: '#arrays',
    nodes: {
      array: ".nest *",
      abc: "::data",
      abcs: {
        sels: "::data",
        filters: [(x)=> parseInt(x)]
      },
      abcd: {
        sels: "::$",
        filters: [(x)=> x.extract('.nest *')]
      }
    }
  },
  // arrays$: '#arrays::data:$'
}, {titleDefault: "pikiest_test"}, {})

let parsedBodyXpath = korok(html, {
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
}, {titleDefault: "pikiest_test"}, {})


function tests(parsedBody, func) {
  return function() {

    it('使用类选择器获取元素', function() {
      expect(parsedBody.extraClass).to.be.equal("class selector")
    })

    it('使用 id 选择器获取元素', function() {
      expect(parsedBody.articleid).to.be.equal("The Road to Enlightenment")
    })

    it('使用 html 标签选择器获取元素', function() {
      expect(parsedBody.articleh4).to.be.equal("The Road to Enlightenment")
    })

    it('使用伪类选择器 [name=author]', function() {
      expect(parsedBody.author).to.be.equal("Karma")
    } )
    
    it('对一般元素默认执行 text() 方法', function() {
      expect(parsedBody.title).to.be.equal("pikiest_test")
    })

    it('通过过滤器变成 camelCase', function() {
      expect(parsedBody.titleFilter).to.be.equal("pikiestTest")
    })

    it('默认从 meta 取 content 属性', function() {
      expect(parsedBody.author).to.be.equal("Karma")
    })

    it('选择多个元素并结成数组', function() {
      expect(parsedBody.array).to.be.eql(['1', '2', '3'])
    })

    it('选择多个元素结成数组, 并取属性', function() {
      expect(parsedBody.arrayValue).to.be.eql(["3", "2", "1"])
    })

    it('选择多个元素结成数组取属性, 并将元素转化位数字', function() {
      expect(parsedBody.arrayValueFilter).to.be.eql([3, 2, 1])
    })

    it('选择多个元素结成数组取属性, 并判断是否小于2', function() {
      expect(parsedBody.arrayValueLte).to.be.eql([false, false, true])
    })    

    it('选择多个元素结成数组, 取属性并重命名', function() {
      expect(parsedBody.arrayValueRename).to.be.eql([
        { data: "3" },
        { data: "2" },
        { data: "1" },
      ])
    })

    it('选择元素单个属性', function(){
      expect(parsedBody.arraysattr).to.be.equal("123")
    })

    it('选择元素单个属性, 并重命名', function(){
      expect(parsedBody.arraysattrRename).to.be.eql({array: "123"})
    })

    it('选择元素单个属性重命名, 并转化为数字', function(){
      expect(parsedBody.arraysattrRenameFilter).to.be.eql({array: 123})
    })      

    it('选择元素多个属性', function(){
      expect(parsedBody.arraysattrs).to.be.eql({data: "123", type: "array"})
    })

    it('选择元素多个属性, 并重命名', function(){
      expect(parsedBody.arraysattrsRename).to.be.eql({array: "123", type: "array"})
    })

    it('全局默认值', function(){
      expect(parsedBody.titleDefault).to.be.equal("pikiest_test")
    })

    if(func) ( func() )
  }
}

describe('解析 html 时通过内联方式,', tests(parsedBodyInline, function(){
  it('获取元素直接下级的 text', function() {
    expect(parsedBodyInline.selfsText).to.be.equal("text")
  })  
}));
describe('解析 html 时通过选项方式,', tests(parsedBodyOpts, function(){
  it('传递默认值', function(){
    expect(parsedBodyOpts.titleDefaultOpt).to.be.equal("pikiest_test")
  })
  it('嵌套取值', function(){
    expect(parsedBodyOpts.nestNode).to.be.eql({
      array:['1', '2', '3'], 
      abc: "123", 
      abcs: 123, 
      abcd: ['1', '2', '3']
    })
  })

  it('通过正则获取', function(){
    expect(parsedBodyOpts.regParsed).to.be.equal("RSS")
  })
  it('获取 html 元素', function() {
    expect(parsedBodyOpts.titleDefault).to.be.equal("pikiest_test")
  })
  it('获取 XRegExp 元素', function() {
    expect(parsedBodyOpts.xregParsed).to.be.equal("03/6/2017")
  })
}))
describe('解析 html 时通过 xpath 选择器,', tests(parsedBodyXpath));
