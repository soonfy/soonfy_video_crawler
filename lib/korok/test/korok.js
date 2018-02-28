import { expect } from 'chai'
import { korokFactory } from "../src/korok_factory"
import * as fs from "fs"
import * as htmlparser from 'htmlparser2'
import { Warpipe, registeWarpipes } from "warpipe"

let warpipe = new Warpipe()
let Korok = korokFactory(warpipe)

let html = fs.readFileSync("./test/statics/index.html").toString()
let $ = new Korok(html)

describe('parse html file,', function(){
  
  it('extract by universal', function(){
    expect($.extract('title*')).to.be.equal("pikiest_test")
  })

  it('extract by tag name', function(){
    expect($.extract('title')).to.be.equal("pikiest_test")
  })

  it('extract by descendant', function(){
    expect($.extract('head title')).to.be.equal("pikiest_test")
  })

  it('extract by child', function(){
    expect($.extract('#arrays>span')).to.be.equal("123")
  })

  it('extract by parent', function(){
    expect($.extract('.array<span::type')).to.be.equal("array")
  })

  it('extract by parent', function(){
    expect($.extract('.array<span::type')).to.be.equal("array")
  })

  it('extract by sibling', function(){
    expect($.extract('#zen-preamble + #arrays::type')).to.be.equal("array")
  })

  it('extract by adjacent', function(){
    expect($.extract('#zen-preamble ~::type')).to.be.equal("array")
  })

  it('extract by adjacent', function(){
    expect($.extract('#zen-preamble ~::type')).to.be.equal("array")
  })

  it('extract by attribute with fullmatch', function(){
    expect($.extract('meta[name=author]')).to.be.equal("Karma")
  })

  it('extract by attribute includes(*=)', function(){
    expect($.extract('meta[name*="th"]')).to.be.equal("Karma")
  })

  it('extract by attribute (|=)', function(){
    expect($.extract('meta[name|="description"]')).to.be.equal("description")
  })

  it('extract by attribute starts with(^=)', function(){
    expect($.extract('meta[name^="aut"]')).to.be.equal("Karma")
  })

  it('extract by attribute ends with($=)', function(){
    expect($.extract('meta[name$="thor"]')).to.be.equal("Karma")
  })

  it('extract by pseudos :not', function(){
    expect($.extract('span:not(.nest)::data')).to.be.equal("123")
  })

  it('extract by pseudos :contains', function(){
    expect($.extract('span:contains(3)::data')).to.be.equal("123")
  })

  it('extract by pseudos :has', function(){
    expect($.extract('span:has(.nest)|trimAll')).to.be.equal("123")
  })

  it('extract by pseudos :empty', function(){
    expect($.extract('span:empty::value')).to.be.equal("5")
  })

  it('extract by pseudos :nth-child', function(){
    expect($.extract('span:first-child::value')).to.be.equal("3")
  })

  it('extract by pseudos :nth-of-type', function(){
    expect($.extract('.array:nth-of-type(1)')).to.be.equal("1")
  })

  // it('extract by pseudos :nth-of-type 2', function(){
  //   expect($.extract('.NumberBoard-item:nth-of-type(2) .NumberBoard-value|numbers')).to.be.equal("1")
  // })  

})