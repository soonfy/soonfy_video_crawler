import { korokFactory } from "./src/korok_factory"
import { isBlank } from "./src/utils"
import { isString, isFunction, defaultsDeep, defaults, isArray} from "lodash"
import { Warpipe, registerWarpipes } from "warpipe"
import { Json2Xml } from './src/parser/json2xml'
import Recipe from './src/parser/recipe'
import filters from './src/filters'
import * as XRegExp from 'xregexp'

registerWarpipes(filters)

export class Korok {
  constructor(recipes, opts) {
    this.recipes = recipes
    this.parsedRecipes = {}
    if(isFunction(recipes)) {
      this.recipeFunc = recipes
    } else if(recipes) {
      for(let name in recipes) { this.parsedRecipes[name] = Recipe.parse(recipes[name]) }
    }
    this.options = opts
    this.KorokPicker = korokFactory(new Warpipe(opts.context))
  }

  pick(body, defaults, opts) {
    switch (opts.format) {
      case 'raw':
        break
      case 'json':
        body = JSON.parse(body); break
      case 'json:xml':
        body = Json2Xml.parse(body); break
      default:
        if (body.match(/^\s*{/)) { body = Json2Xml.parse(body) }
    }
    if(this.recipeFunc) {
      return defaultsDeep(this.recipeFunc(body), defaults)
    }
    if(isBlank(this.parsedRecipes)) {
      if(opts.format == "raw" || opts.format == "json") { return body }
      return new this.KorokPicker(body, opts)
    } else {
      let parsedBody = new this.KorokPicker(body, opts).toObj(this.parsedRecipes)
      return defaultsDeep(parsedBody, defaults)
    }
  }
}

export function korok(body, recipes, defaults, opts = {}) {
  if(isString(recipes)) {
    let korok = new Korok({result: recipes}, opts)
    return korok.pick(body, defaults, opts).result
  } else {
    let korok = new Korok(recipes, opts)
    return korok.pick(body, defaults, opts)
  }
}

export function registeFilters(filters, func) {
  return registeWarpipes(filters, func)
}

export function re(regexp, filters) {
  if(isArray(regexp)) {
    let sels = function(text) {
      return XRegExp.matchChain(text, regexp)
    }
    return { sels, filters }
  } else {
    let sels = function(text) {
      return XRegExp.exec(text, XRegExp(regexp))
    }
    return { sels, filters }
  }
}