import { 
	toString,
	castArray,
  isString,
  flattenDeep,
  uniq,
  omit,
  keys,
  isNumber,
  includes,
  isObject,
  isEmpty
} from "lodash"

import * as util from 'util'

export const isBlank = (el) => {
  if (isString(el)) {
    return el.length == 0
  } else if (isNumber(el)) {
    return false
  } else {
    return isEmpty(el)
  }
}

import * as expand from 'expand-range'

function onlyOneQuery(baseUrl) {
  return uniq(baseUrl.match(/\${.+?}/g)).length == 1
}

function makeUrls(baseUrl, iterators, context) {
  for(let i in iterators) {
    let iterator = iterators[i]
    let urls = iterator.iterator.map(it=> baseUrl.replace(iterator.placeholder, it) )
    iterators = omit(iterators, i)
    if(keys(iterators).length == 0 ) { return urls }
    else { return urls.map(url=> makeUrls(url, iterators, context)) }
  }
}
// https://github.com/davidchambers/string-format
export const iterateUrls = (baseUrl, context) => {
  let iterators = (baseUrl.match(/{.+?}/g) || []).map(x=> x.replace(/[{}]/g, ''))
  if(iterators.length == 0 ) { return baseUrl }
  let _iterators = [], _iteratobjs = {}
  for(let i in iterators) {
    let iterator = iterators[i]
    if(includes(iterator, '.')) { iterator = expand(iterator) }
    else { iterator = context[iterator]}    
    if(!isObject(iterator)) { iterator = [iterator] }
    _iteratobjs[toString(i)] = {
      placeholder: "{" + iterators[i] + "}",
      iterator,
    }
  }
  return flattenDeep(makeUrls(baseUrl, _iteratobjs, context))
}