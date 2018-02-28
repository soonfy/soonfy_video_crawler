"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const request = require("request");
const charset = require("charset");
const jschardet = require("jschardet");
const os = require("os");
const lodash_1 = require("lodash");
let decode;
if (os.platform() == "win32") {
    let iconv = require("iconv-lite");
    decode = (buffer, encoding) => {
        return iconv.decode(buffer, encoding);
    };
}
else {
    let Iconv = require("iconv").Iconv;
    decode = (buffer, encoding) => {
        let iconv = new Iconv(encoding, 'UTF-8//TRANSLIT//IGNORE');
        return iconv.convert(buffer).toString();
    };
}
const defaultOpts = {
    method: 'GET',
    timeout: 120000,
    encoding: null,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36'
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (opts) => __awaiter(this, void 0, void 0, function* () {
    let response = yield new Promise(function (resolve, reject) {
        request(lodash_1.defaultsDeep(opts, defaultOpts), function (err, res, body) {
            if (err) {
                reject(err);
            }
            else {
                let result, buffer = body;
                let encoding = charset(res, buffer);
                encoding = encoding || jschardet.detect(buffer).encoding;
                if (encoding) {
                    if (lodash_1.includes(['ascii', 'utf', 'utf8'], encoding)) {
                        res.text = buffer.toString();
                    }
                    else {
                        res.text = decode(buffer, encoding);
                    }
                }
                resolve(res);
            }
        });
    });
    return response;
});
//# sourceMappingURL=request.js.map