"use strict";
const typhoeus_1 = require("typhoeus");
const lodash_1 = require("lodash");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (epona, opts) => {
    epona.throttle = new typhoeus_1.default(lodash_1.defaults(opts, {
        concurrent: 10,
        acquire: (item) => {
            return epona.dispatcher.parse(item.url, ['acquire'])(item);
        },
        release: (parsedBody, item) => {
            return epona.dispatcher.parse(item.url, ['release', item])(parsedBody);
        },
        error: (error, item) => {
            epona.logger.error('------ error msg ------');
            epona.logger.error(`${item.method}: ${item.url}`);
            epona.logger.error(error.message, '\n');
            epona.logger.error('------ stack info ------');
            epona.logger.error(error.stack);
        }
    }));
};
//# sourceMappingURL=typhoeus.js.map