import * as _ from "lodash"
import * as extract from "extract-values"
import { stringFormat } from "./string_format"
// import * as stringFormat from "string-template"
import lodashFilters from "./lodash"

let numbers = (ret, dft = null) => {
  return (ret || ret == '' ) ? _.toNumber((ret || '').replace(/[^\d]/g,'')) : dft
}

let trimAll = (text) => {
	if(!text) { return "" }
	text = text.replace('&nbsp;', '')
  return text.replace(/[\s]+/g, ""); 
}

let second = (array) => array[1]
let third = (array) => array[1]
let print = () => console.log.apply(console, arguments)
let format = (obj, str) => stringFormat(str)(obj)
let double = (x) => x*2
export default _.defaults({
    numbers
  , trimAll
  , second
  , third
  , print
  , extract
  , format
  , double
}, lodashFilters)