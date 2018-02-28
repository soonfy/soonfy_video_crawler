import { omit, defaults, isString, flatten } from "lodash"
export default function(xeno, opts) {
  if(isString(opts)) {
    let recipes
    if(xeno._recipes.__next) {
      recipes = omit(xeno._recipes, '__next')
      xeno._recipes = { __next: xeno._recipes.__next }
    } else {
      recipes = xeno._recipes
      xeno._recipes = {}
    }
    xeno._recipes['items'] = {
        sels: opts + ' *' 
      , nodes: recipes
    }
  } else {

  }

  xeno.afterParse(function(crawled){
    let defaultval = omit(crawled, ['items', '__next'])
    return crawled.items.map(item=>defaults(item, defaultval))
  })

  xeno.afterCrawl(function(crawled){
    return flatten(crawled)
  })

}