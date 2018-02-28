import { concat, includes, defaults, isString, 
         isPlainObject, mapValuesWithKey, clone,
         castArray, isArray, isFunction, endsWith, startsWith,
         lastIndexOf, trim, flatten
       } from "lodash"
import { isHtml, isTag, isBlank, crc32 } from "../utils"
import { parseFilters } from './selector'
import { xPathToCss } from './xpath'
import * as csswhat from "css-what"

function parseSelector(selector, attrs, nodes) {
  let sels, exps, filters = '', each = false;
  [sels, exps] = selector.split('::')
  sels = trim(sels); exps = trim(exps)
  attrs = attrs ? parseAttrs(attrs) : []
  if(exps) {
    attrs = parseFilters(exps)
  } else {
    let fi = selector.lastIndexOf('|')
    if(fi >= 0) {
      let fin = selector.lastIndexOf('|=')
      if(fin != fi) { 
        fi = selector.indexOf('|')
        sels  = selector.slice(0, fi)
        filters = selector.slice(fi + 1, selector.length)
      }          
    }
  }
  if(endsWith(sels, ' *')) {
    sels = sels.slice(0, sels.length - 2)
    each = true
  }
  if(startsWith(sels, '/')) { sels = xPathToCss(sels) }
  if(attrs.length == 0 && !nodes) {
    let matched = (filters).match(/^\$\s*[\|]?/)
    if(matched) {
      attrs.push("$"); filters = filters.replace(matched[0], '')
    } else {
      attrs = defaultAttr(sels)
    }
  }

  return { sels, attrs, filters, each, css: csswhat(sels), nodes }
}

function parseAttrs(attrs) {
  if(isString(attrs)) {
    return parseFilters(attrs)
  } else if(isArray(attrs)) {
    return flatten(attrs.map(parseFilters))
  } else if(isPlainObject(attrs)) {
    let parsedAttrs = {}
    for(let child in attrs) { 
      parsedAttrs[child] = Recipe.parse(attrs[child]) }
    return parsedAttrs
  }
}

function defaultAttr(sels) {
  if (sels == 'a' || sels == "link") {
    return [{attr:"href"}]
  } else if(includes(sels, 'meta')) {
    return [{attr: "content"}]
  } else if(isFunction(sels)) {
    return []
  } else {
    return [{ attr: "text()"}]
  }
}

function makeFilterName(func) {
  return ("_func_" + crc32(func.toString()).toString(16)).replace('-', '_')
}

export default class Recipe {
  constructor(recipe) {
    this._recipe = recipe
    this._compiledRecipe = Recipe.parse(recipe)
  }
  
  static parse(recipes) {
    let compiledRecipes
    let attrs, filters = '', selectors, context = {}, nodes, join, flatten

    // eg: count: { sels: '.count' , attrs: 'data' , filters:[function, 'trim | toNumber']}
    if(isPlainObject(recipes)) { 
      attrs = recipes.attrs
      if(recipes.nodes) {
        nodes = {}
        for(let node in recipes.nodes) {
          nodes[node] = Recipe.parse(recipes.nodes[node])
        }
      }
      filters = recipes.filters || filters
      selectors = recipes.sels
      join = recipes.join
      flatten = recipes.flatten
    } else {
      selectors = recipes
    }

    if(!isString(filters)) {
      filters = castArray(filters).map(filter=>{
        if(isFunction(filter)) { 
          let filterName = makeFilterName(filter)
          context[filterName] = filter 
          return filterName
        }
        return filter
      }).join('|')
    }

    selectors = castArray(selectors)

    selectors = selectors.map((selector)=>{
      let parsedSelector
      if(isString(selector)) {
        parsedSelector = parseSelector(selector, attrs, nodes)
      } else {
        parsedSelector = { sels: selector }
      }

      return parsedSelector
    })

    return {
      __compiled: true,
      default: recipes.default || null, 
      filters: filters || '',
      context, join, flatten,
      recipes: selectors
    }
  }
}


