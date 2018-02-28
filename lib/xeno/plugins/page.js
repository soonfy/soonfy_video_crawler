import { isString, isPlainObject, includes } from "lodash"
import { stringFormat as format } from "warpipe/src/string_format"
export default function(xeno, opts) {
  if(isString(opts)) {
    xeno._pageinator = opts
  } else if(isPlainObject(opts)) {
    xeno._pageinator = opts.pageinator
    xeno._startPage = opts.startPage
  } 
  if(!xeno._startPage) { xeno._startPage = 1}
  if(!xeno._pageinator) { xeno._pageinator = 'page' }

  xeno.beforeCrawl(function(url) {
    if(!url.qs) { url.qs = {} }
    if(!url.qs[xeno._pageinator]) { url.qs[xeno._pageinator] = xeno._startPage }
    url.default.__url = { url: url.url, qs: url.qs }
    return url
  })
  
  xeno.afterParse(function(crawled){
    crawled.__url.qs[xeno._pageinator] += 1
    setImmediate(function(){
      xeno.crawl(crawled.__url)
    })
    return crawled
  })

  // xeno.page() {

  //   return this
  // }

}