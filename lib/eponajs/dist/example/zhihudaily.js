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
let epona = Epona.new();
epona.on('story/{id}', {
    image: '.img-wrap img::src',
    title: '.headline-title',
    answers: {
        sels: '.content-inner .question *',
        nodes: {
            question: '.question-title',
            content: '.answer|trim'
        },
        filters: 'filter("question")'
    },
})
    .host('http://daily.zhihu.com')
    .then(function (ret, res, id) {
    console.log(res.extract('.headline-title'));
    return ret;
});
let run = () => __awaiter(this, void 0, void 0, function* () {
    let a = yield epona.queue([{ url: 'http://daily.zhihu.com/story/9266807' }]);
});
run();
//# sourceMappingURL=zhihudaily.js.map