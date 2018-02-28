export function parseFilters (exp) {
  let inSingle = false
  let inDouble = false
  let inTemplateString = false
  let inRegex = false
  let curly = 0
  let square = 0
  let paren = 0
  let lastFilterIndex = 0
  let c, prev, i, filters

  for (i = 0; i < exp.length; i++) {
    prev = c
    c = exp.charCodeAt(i)
    if (inSingle) {
      if (c === 0x27 && prev !== 0x5C) inSingle = false
    } else if (inDouble) {
      if (c === 0x22 && prev !== 0x5C) inDouble = false
    } else if (inTemplateString) {
      if (c === 0x60 && prev !== 0x5C) inTemplateString = false
    } else if (inRegex) {
      if (c === 0x2f && prev !== 0x5C) inRegex = false
    } else if (
      c === 0x2C && // ,
      exp.charCodeAt(i + 1) !== 0x2C &&
      exp.charCodeAt(i - 1) !== 0x2C &&
      !curly && !square && !paren
    ) {
      pushFilter()
    } else {
      switch (c) {
        case 0x22: inDouble = true; break         // "
        case 0x27: inSingle = true; break         // '
        case 0x60: inTemplateString = true; break // `
        case 0x28: paren++; break                 // (
        case 0x29: paren--; break                 // )
        case 0x5B: square++; break                // [
        case 0x5D: square--; break                // ]
        case 0x7B: curly++; break                 // {
        case 0x7D: curly--; break                 // }
      }
      if (c === 0x2f) { // /
        let j = i - 1
        let p
        // find first non-whitespace prev char
        for (; j >= 0; j--) {
          p = exp.charAt(j)
          if (p !== ' ') break
        }
        if (!p || !/[\w$]/.test(p)) {
          inRegex = true
        }
      }
    }
  }
  if (i > 0) {
    pushFilter()
  }

  function pushFilter () {
    (filters || (filters = [])).push(wrap(exp.slice(lastFilterIndex, i).trim()))
    lastFilterIndex = i + 1
  }

  return filters
}

function wrap(exps) {
  let fi = exps.indexOf('|')
  if(fi > 0) {
    let attr = exps.slice(0, fi).split(':')
    return {
        attr: attr[0]
      , name: attr[1]
      , filters: exps.slice(fi + 1, exps.length) 
    }
  } else { 
    let attr = exps.split(':')
    return { 
        attr: attr[0]
      , name: attr[1] 
    }
  }
}