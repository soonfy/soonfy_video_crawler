import { expect } from 'chai'
import { Warpipe, warpipe, registerWarpipes } from "../index"
let warpipeo = new Warpipe

describe('parse and exec filters,', function(){
  it('default filters', function(){
    expect(warpipe(
        "/2012/08/12/test.html"
      , 'extract("/{year}/{month}/{day}/{title}.html")')).to.be.eql({ 
        year: '2012', month: '08', day: '12', title: 'test' 
      })
  })

  it('with default filters', function(){
    expect(warpipe(
        [1, 2, 3]
      , 'reverse | nth(2)')).to.be.equal(1)
  })

  it('with custom filters', function(){
    expect(warpipe(
        [1, 2, 3]
      , 'reverse | nth(2)| double'
      , {
        double: (x) => x*2
      })).to.be.equal(2)
  })

  it('default filters(new Warpipe)', function(){
    expect(warpipeo.exec(
        "/2012/08/12/test.html" 
      , 'extract("/{year}/{month}/{day}/{title}.html")')).to.be.eql({ 
        year: '2012', month: '08', day: '12', title: 'test' 
      })
  })

  it('with default filters(new Warpipe)', function(){
    expect(warpipeo.exec(
        [1, 2, 3]
      , 'reverse | nth(2)')).to.be.equal(1)
  })

  it('with custom filters(new Warpipe)', function(){
    expect(warpipeo.exec(
        [1, 2, 3]
      , 'reverse | nth(2)| double', {
        double: (x) => x*2
      })).to.be.equal(2)
  })

  warpipeo.register({
    trible: (x) => x*3
  })
  
  it('with register filters(new Warpipe)', function(){
    expect(warpipeo.exec(
        [1, 2, 3]
      , 'reverse | nth(2)| trible')).to.be.equal(3)
  })
  
  registerWarpipes(({
    absAndDouble: (x) => Math.abs(x)*2
  }))

  it('with register user filters(new Warpipe)', function(){
    expect(warpipeo.exec(
        [-1, -2, -3]
      , 'reverse | nth(2)| absAndDouble')).to.be.equal(2)
  })  
})
