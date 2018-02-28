import { isString, isPlainObject } from "lodash"
export default function(xeno, opts) {
  if(isString(opts)) {
    xeno.parseSchema({
      __next: opts
    })
    xeno.afterParse(function(crawled){
      if(xeno._recipes.__next && crawled.__next) {
        xeno.push(crawled.__next)
      }
      return crawled
    })
  } else if(isPlainObject(opts)) {
    if(opts.url) {
      xeno.afterParse(function(crawled){
        xeno.push(opts)
        return crawled
      })
    } else if(opts.paginator) {
      xeno.afterParse(function(crawled){
        let qs = {}
        if(crawled.__page) { qs[opts.paginator] = crawled.__page + 1 }
        else { qs[opts.paginator] = 2 }
        // console.log({
        //     url: crawled.__url
        //   , qs  
        // })
        xeno.crawl([{
            url: crawled.__url
          , qs  
        }])
        return crawled
      })
    }
  }


}