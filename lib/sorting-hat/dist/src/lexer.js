"use strict";
const ESCAPE_CHARS_REGEXP = /[\\.+*?\^$\[\](){}\/'#]/g, LOOSE_SLASHES_REGEXP = /^\/|\/$/g, LEGACY_SLASHES_REGEXP = /\/$/g, PARAMS_REGEXP = /(?:\{|:)([^}:]+)(?:\}|:)/g, TOKENS = {
    'OS': {
        rgx: /([:}]|\w(?=\/))\/?(:|(?:\{\?))/g,
        save: '$1{{id}}$2',
        res: '\\/?'
    },
    'RS': {
        rgx: /([:}])\/?(\{)/g,
        save: '$1{{id}}$2',
        res: '\\/'
    },
    'RQ': {
        rgx: /\{\?([^}]+)\}/g,
        res: '\\?([^#]+)'
    },
    'OQ': {
        rgx: /:\?([^:]+):/g,
        res: '(?:\\?([^#]*))?'
    },
    'OR': {
        rgx: /:([^:]+)\*:/g,
        res: '(.*)?'
    },
    'RR': {
        rgx: /\{([^}]+)\*\}/g,
        res: '(.+)'
    },
    'RP': {
        rgx: /\{([^}]+)\}/g,
        res: '([^\\/?]+)'
    },
    'OP': {
        rgx: /:([^:]+):/g,
        res: '([^\\/?]+)?\/?'
    }
}, LOOSE_SLASH = 1, STRICT_SLASH = 2, LEGACY_SLASH = 3;
class Lexer {
    constructor() {
        let key, cur;
        this._slashMode = LOOSE_SLASH;
        for (key in TOKENS) {
            if (TOKENS.hasOwnProperty(key)) {
                cur = TOKENS[key];
                cur.id = '__CR_' + key + '__';
                cur.save = ('save' in cur) ? cur.save.replace('{{id}}', cur.id) : cur.id;
                cur.rRestore = new RegExp(cur.id, 'g');
            }
        }
    }
    captureVals(regex, pattern) {
        let vals = [], match;
        regex.lastIndex = 0;
        while (match = regex.exec(pattern)) {
            vals.push(match[1]);
        }
        return vals;
    }
    getParamIds(pattern) {
        return this.captureVals(PARAMS_REGEXP, pattern);
    }
    getOptionalParamsIds(pattern) {
        return this.captureVals(TOKENS.OP.rgx, pattern);
    }
    compilePattern(pattern, ignoreCase) {
        pattern = pattern || '';
        let includedHost = (pattern.indexOf('http:') === 0 || pattern.indexOf('https:') === 0 || pattern.indexOf('file:') === 0);
        if (pattern) {
            if (this._slashMode === LOOSE_SLASH) {
                pattern = pattern.replace(LOOSE_SLASHES_REGEXP, '');
            }
            else if (this._slashMode === LEGACY_SLASH) {
                pattern = pattern.replace(LEGACY_SLASHES_REGEXP, '');
            }
            pattern = this.replaceTokens(pattern, 'rgx', 'save');
            pattern = pattern.replace(ESCAPE_CHARS_REGEXP, '\\$&');
            pattern = this.replaceTokens(pattern, 'rRestore', 'res');
            if (this._slashMode === LOOSE_SLASH) {
                pattern = '\\/?' + pattern;
            }
        }
        if (this._slashMode !== STRICT_SLASH) {
            pattern += '\\/?';
        }
        if (includedHost) {
            return new RegExp('^' + pattern + '$', ignoreCase ? 'i' : '');
        }
        else {
            return new RegExp(pattern, ignoreCase ? 'i' : '');
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
        replacements = replacements || {};
        if (typeof pattern !== 'string') {
            throw new Error('Route pattern should be a string.');
        }
        let replaceFn = function (match, prop) {
            let val;
            prop = (prop.substr(0, 1) === '?') ? prop.substr(1) : prop;
            if (replacements[prop] != null) {
                if (typeof replacements[prop] === 'object') {
                    let queryParts = [], rep;
                    for (let key in replacements[prop]) {
                        rep = replacements[prop][key];
                        if (isArray(rep)) {
                            for (let k in rep) {
                                if (key.slice(-2) == '[]') {
                                    queryParts.push(encodeURI(key.slice(0, -2)) + '[]=' + encodeURI(rep[k]));
                                }
                                else {
                                    queryParts.push(encodeURI(key + '=' + rep[k]));
                                }
                            }
                        }
                        else {
                            queryParts.push(encodeURI(key + '=' + rep));
                        }
                    }
                    val = '?' + queryParts.join('&');
                }
                else {
                    val = String(replacements[prop]);
                }
                if (match.indexOf('*') === -1 && val.indexOf('/') !== -1) {
                    throw new Error('Invalid value "' + val + '" for segment "' + match + '".');
                }
            }
            else if (match.indexOf('{') !== -1) {
                throw new Error('The segment ' + match + ' is required.');
            }
            else {
                val = '';
            }
            return val;
        };
        if (!TOKENS.OS.trail) {
            TOKENS.OS.trail = new RegExp('(?:' + TOKENS.OS.id + ')+$');
        }
        return pattern
            .replace(TOKENS.OS.rgx, TOKENS.OS.save)
            .replace(PARAMS_REGEXP, replaceFn)
            .replace(TOKENS.OS.trail, '')
            .replace(TOKENS.OS.rRestore, '/');
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Lexer;
//# sourceMappingURL=lexer.js.map