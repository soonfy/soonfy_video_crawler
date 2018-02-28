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
const lodash_1 = require("lodash");
let run = () => __awaiter(this, void 0, void 0, function* () {
    let urls = yield Epona.get('https://ruby-china.org/topics?page={1..1}', '.title a *::href');
    let articles = yield Epona.get(lodash_1.flatten(urls).map((x) => 'http://www.ruby-china.org' + x), {
        title: 'title',
        content: '.topic-detail .panel-body|trimAll',
        replays: {
            sels: '.reply .infos *',
            nodes: {
                name: '.user-name',
                contens: '.markdown'
            }
        }
    });
    console.log(articles);
});
run();
//# sourceMappingURL=rubychina.js.map