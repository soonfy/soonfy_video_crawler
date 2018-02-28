"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const Epona = require("../index");
let run = () => __awaiter(this, void 0, void 0, function* () {
    let urls = yield Epona.get({
        url: 'http://apis.web.pptv.com/show/videoList?pid=9042083&vt=22', headers: { cookie: 'ppi=302c31;' }
    }, 'data::total');
    console.log(urls);
});
run();
//# sourceMappingURL=hackernews.js.map