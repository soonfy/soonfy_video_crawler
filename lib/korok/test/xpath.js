import { xPathToCss } from '../src/parser/xpath'

console.log(xPathToCss('//title | //price'))
// console.log(xPathToCss('/bookstore/book[price>35.00]'))