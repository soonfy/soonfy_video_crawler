"use strict";
const winston = require("winston");
function default_1(epona, opts = {}) {
    let myCustomLevels = {
        levels: { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 },
        colors: { error: 'red', warn: 'yellow', info: 'green', verbose: 'cyan', debug: 'blue', silly: 'white' }
    };
    epona.logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({ colorize: true }),
        ],
        colorize: true
    });
    winston.addColors(myCustomLevels.colors);
    epona.logger.level = opts.logLevel || "info";
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
//# sourceMappingURL=winston.js.map