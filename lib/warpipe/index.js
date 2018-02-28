import { safeEval } from "./src/eval"
import defaultFilters from "./src/filters"
import { parseFilters } from "./src/parser"
import { assign, isPlainObject, isString, isFunction, defaults } from "lodash"
let userFilters = {}
export let warpipe = function(seed, filtersString, context) {
  let compiledFilters = parseFilters('__msg | ' + filtersString)
  if(!context) { context = {} }
  context.__msg = seed 
  defaults(context, userFilters)
  return safeEval(compiledFilters, context)
}

export let registerWarpipes = function(filters, func) {
  if(isPlainObject(filters)) {
    assign(userFilters, filters)
  } else if(isString(filters) && isFunction(func)) {
    userFilters[filters] = func
  }
  return userFilters
}

export class Warpipe {
  constructor(context) {
    this._context = {}
    if(context) {this.context(context)}
  }

  register(key, val) {
    if(!key) return
    if(isPlainObject(key)) {
      this._context = assign(this._context, key)
    } else {
      this._context[key] = val
    }
    return this
  }  

  exec(seed, filtersString, context) {
    let compiledFilters = parseFilters('__msg | ' + filtersString)
    if(!filtersString || filtersString == "") { return seed }
    if(!context) { context = {} }
    context = defaults(context, userFilters, this._context)
    context.__msg = seed
    return safeEval(compiledFilters, context)
  }
}

export let filters = defaultFilters