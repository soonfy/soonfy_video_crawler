"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (epona, opts) => {
    let callback;
    epona.dispatcher = {
        on(path, fn) { callback = fn; },
        parse(url, args) { return callback.apply(undefined, args); }
    };
};
//# sourceMappingURL=oneroute.js.map