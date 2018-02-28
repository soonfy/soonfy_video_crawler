const ESCAPE_CHARS_REGEXP = /[\\.+*?\^$\[\](){}\/'#]/g,
      LOOSE_SLASHES_REGEXP = /^\/|\/$/g,
      LEGACY_SLASHES_REGEXP = /\/$/g,

      //params - everything between `{ }` or `: :`
      PARAMS_REGEXP = /(?:\{|:)([^}:]+)(?:\}|:)/g,

      TOKENS = {
        'OS': {
          //optional slashes
          //slash between `::` or `}:` or `\w:` or `:{?` or `}{?` or `\w{?`
          rgx : /([:}]|\w(?=\/))\/?(:|(?:\{\?))/g,
          save : '$1{{id}}$2',
          res : '\\/?'
        },
        'RS': {
          //required slashes
          //used to insert slash between `:{` and `}{`
          rgx : /([:}])\/?(\{)/g,
          save : '$1{{id}}$2',
          res : '\\/'
        },
        'RQ' : {
          //required query string - everything in between `{? }`
          rgx : /\{\?([^}]+)\}/g,
          //everything from `?` till `#` or end of string
          res : '\\?([^#]+)'
        },
        'OQ' : {
          //optional query string - everything in between `:? :`
          rgx : /:\?([^:]+):/g,
          //everything from `?` till `#` or end of string
          res : '(?:\\?([^#]*))?'
        },
        'OR' : {
          //optional rest - everything in between `: *:`
          rgx : /:([^:]+)\*:/g,
          res : '(.*)?' // optional group to avoid passing empty string as captured
        },
        'RR' : {
          //rest param - everything in between `{ *}`
          rgx : /\{([^}]+)\*\}/g,
          res : '(.+)'
        },
        // required/optional params should come after rest segments
        'RP' : {
          //required params - everything between `{ }`
          rgx : /\{([^}]+)\}/g,
          res : '([^\\/?]+)'
        },
        'OP' : {
          //optional params - everything between `: :`
          rgx : /:([^:]+):/g,
          res : '([^\\/?]+)?\/?'
        }
      },

      LOOSE_SLASH = 1,
      STRICT_SLASH = 2,
      LEGACY_SLASH = 3,

export default class Lexer {
  constructor() {
    let key, cur
    this._slashMode = LOOSE_SLASH
    for (key in TOKENS) {
      if (TOKENS.hasOwnProperty(key)) {
        cur = TOKENS[key];
        cur.id = '__CR_'+ key +'__';
        cur.save = ('save' in cur)? cur.save.replace('{{id}}', cur.id) : cur.id;
        cur.rRestore = new RegExp(cur.id, 'g');
      }
    }
  }

  captureVals (regex, pattern) {
    let vals = [], match
    // very important to reset lastIndex since RegExp can have "g" flag
    // and multiple runs might affect the result, specially if matching
    // same string multiple times on IE 7-8
    regex.lastIndex = 0
    while (match = regex.exec(pattern)) {
      vals.push(match[1])
    }
    return vals
  }

  getParamIds(pattern) {
    return this.captureVals(PARAMS_REGEXP, pattern);
  }

  getOptionalParamsIds(pattern) {
    return this.captureVals(TOKENS.OP.rgx, pattern);
  }
 
  compilePattern(pattern, ignoreCase) {
    pattern = pattern || '';
    let includedHost = (pattern.indexOf('http:') === 0 || pattern.indexOf('https:') === 0  || pattern.indexOf('file:') === 0)
    if(pattern){
      if (this._slashMode === LOOSE_SLASH) {
        pattern = pattern.replace(LOOSE_SLASHES_REGEXP, '');
      }
      else if (this._slashMode === LEGACY_SLASH) {
        pattern = pattern.replace(LEGACY_SLASHES_REGEXP, '');
      }
      
      //save tokens
      pattern = this.replaceTokens(pattern, 'rgx', 'save');
      //regexp escape
      pattern = pattern.replace(ESCAPE_CHARS_REGEXP, '\\$&');
      //restore tokens
      pattern = this.replaceTokens(pattern, 'rRestore', 'res');

      if (this._slashMode === LOOSE_SLASH) {
        pattern = '\\/?'+ pattern;
      }
    }

    if (this._slashMode !== STRICT_SLASH) {
      //single slash is treated as empty and end slash is optional
      pattern += '\\/?';
    }
    if(includedHost) {
      return new RegExp('^'+ pattern + '$', ignoreCase? 'i' : '')
    } else {
      return new RegExp(pattern, ignoreCase? 'i' : '')
    }
  }

  replaceTokens(pattern, regexpName, replaceName) {
    var cur, key;
    for (key in TOKENS) {
      if (TOKENS.hasOwnProperty(key)) {
        cur = TOKENS[key];
        pattern = pattern.replace(cur[regexpName], cur[replaceName]);
      }
    }
    return pattern;
  }

  getParamValues(request, regexp, shouldTypecast) {
    var vals = regexp.exec(request);
    if (vals) {
      vals.shift();
      if (shouldTypecast) {
        vals = typecastArrayValues(vals);
      }
    }
    return vals;
  }
 
  interpolate(pattern, replacements) {
    // default to an empty object because pattern might have just
    // optional arguments
    replacements = replacements || {}
    if (typeof pattern !== 'string') {
        throw new Error('Route pattern should be a string.')
    }

    let replaceFn = function(match, prop){
      let val;
      prop = (prop.substr(0, 1) === '?')? prop.substr(1) : prop
      if (replacements[prop] != null) {
        if (typeof replacements[prop] === 'object') {
          let queryParts = [], rep
          for(let key in replacements[prop]) {
            rep = replacements[prop][key]
            if (isArray(rep)) {
              for (let k in rep) {
                if ( key.slice(-2) == '[]' ) {
                  queryParts.push(encodeURI(key.slice(0, -2)) + '[]=' + encodeURI(rep[k]))
                } else {
                  queryParts.push(encodeURI(key + '=' + rep[k]))
                }
              }
            }
            else {
              queryParts.push(encodeURI(key + '=' + rep))
            }
          }
          val = '?' + queryParts.join('&')
        } else {
          // make sure value is a string see #gh-54
          val = String(replacements[prop])
        }

        if (match.indexOf('*') === -1 && val.indexOf('/') !== -1) {
          throw new Error('Invalid value "'+ val +'" for segment "'+ match +'".')
        }
      }
      else if (match.indexOf('{') !== -1) {
        throw new Error('The segment '+ match +' is required.');
      }
      else {
        val = ''
      }
      return val
    }

    if (! TOKENS.OS.trail) {
      TOKENS.OS.trail = new RegExp('(?:'+ TOKENS.OS.id +')+$');
    }

    return pattern
             .replace(TOKENS.OS.rgx, TOKENS.OS.save)
             .replace(PARAMS_REGEXP, replaceFn)
             .replace(TOKENS.OS.trail, '') // remove trailing
             .replace(TOKENS.OS.rRestore, '/'); // add slash between segments
  }

}