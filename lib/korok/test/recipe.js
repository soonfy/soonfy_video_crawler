import { expect } from 'chai'
import { korokFactory } from "../src/korok_factory"
import * as fs from "fs"
import * as htmlparser from 'htmlparser2'
import { Warpipe, registeWarpipes } from "warpipe"

// let warpipe = new Warpipe()
// let Korok = korokFactory(warpipe)

// let html = fs.readFileSync("./test/statics/index.html").toString()
// let $ = new Korok(html)

// describe('parse html file,', function(){
  
//   it('extract by universal', function(){
//     expect($.extract('title*')).to.be.equal("pikiest_test")
//   })
// })