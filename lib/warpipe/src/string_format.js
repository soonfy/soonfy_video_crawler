// MIT Licenced authored by Matt-Esch
// https://github.com/Matt-Esch/string-template

let whitespaceRegex = /["'\\\n\r\u2028\u2029]/g
let nargs = /\{[0-9a-zA-Z|]+\}/g
import { warpipe } from "../index"

let replaceTemplate =
"    let args\n" +
"    let result\n" +
"    if (arguments.length === 1 && typeof arguments[0] === \"object\") {\n" +
"        args = arguments[0]\n" +
"    } else {\n" +
"        args = arguments" +
"    }\n\n" +
"    if (!args || !(\"hasOwnProperty\" in args)) {\n" +
"       args = {}\n" +
"    }\n\n" +
"    return {0}"

let literalTemplate = "\"{0}\""
let argTemplate = "(result = args.hasOwnProperty(\"{0}\") ? " +
  "args[\"{0}\"] : null, \n        " +
  "(result === null || result === undefined) ? \"\" : result)"

export function stringFormat(string) {
  let replacements = string.match(nargs) || []
  let interleave = string.split(nargs)
  let replace = []

  for (let i = 0; i < interleave.length; i++) {
    let current = interleave[i]
    let replacement = replacements[i]
    let escapeLeft = current.charAt(current.length - 1)
    let escapeRight = (interleave[i + 1] || "").charAt(0)

    if (replacement) {
      replacement = replacement.substring(1, replacement.length - 1)
    }

    if (escapeLeft === "{" && escapeRight === "}") {
      replace.push(current + replacement)
    } else {
      replace.push(current)
      if (replacement) {
        let fi = replacement.indexOf('|')
        if(fi > 0) {
        replace.push({
          name: replacement.slice(0, fi)
          , filters: replacement.slice(fi+1, replacement.length)
        })
        } else {
        replace.push({ name: replacement })
        }
      }
    }
  }

  let prev = [""]

  for (let j = 0; j < replace.length; j++) {
    let curr = replace[j]

    if (String(curr) === curr) {
      let top = prev[prev.length - 1]

      if (String(top) === top) {
        prev[prev.length - 1] = top + curr
      } else {
        prev.push(curr)
      }
    } else {
      prev.push(curr)
    }
  }

  replace = prev

  return function template() {
    let args

    if (arguments.length === 1 && typeof arguments[0] === "object") {
      args = arguments[0]
    } else {
      args = arguments
    }

    if (!args || !("hasOwnProperty" in args)) {
      args = {}
    }

    let result = []

    for (let i = 0; i < replace.length; i++) {
      if (i % 2 === 0) {
        result.push(replace[i])
      } else {
        let argName = replace[i].name
        let argFilters = replace[i].filters
        let arg = args.hasOwnProperty(argName) ? args[argName] : null
        if(argFilters) { arg = warpipe(arg, argFilters) }
        if (arg !== null || arg !== undefined) {
          result.push(arg)
        }
      }
    }

    return result.join("")
  }
}

function escape(string) {
  string = '' + string
  return string.replace(whitespaceRegex, escapedWhitespace)
}

function escapedWhitespace(character) {
  // Escape all characters not included in SingleStringCharacters and
  // DoubleStringCharacters on
  // http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.4
  switch (character) {
    case '"':
    case "'":
    case '\\':
      return '\\' + character
    // Four possible LineTerminator characters need to be escaped:
    case '\n':
      return '\\n'
    case '\r':
      return '\\r'
    case '\u2028':
      return '\\u2028'
    case '\u2029':
      return '\\u2029'
  }
}