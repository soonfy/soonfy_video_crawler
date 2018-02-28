"use strict";
const vm = require("vm");
const lodash_1 = require("lodash");
const filters_1 = require("./filters");
function safeEval(code, context, opts) {
    var sandbox = {};
    var resultKey = 'SAFE_EVAL_' + Math.floor(Math.random() * 1000000);
    sandbox[resultKey] = {};
    code = resultKey + '=' + code;
    context = lodash_1.defaults(context, filters_1.default);
    if (context) {
        Object.keys(context).forEach(function (key) {
            sandbox[key] = context[key];
        });
    }
    vm.runInNewContext(code, sandbox, opts);
    return sandbox[resultKey];
}
exports.safeEval = safeEval;
//# sourceMappingURL=eval.js.map