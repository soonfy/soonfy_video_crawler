"use strict";
const Epona = require("../index");
Epona.get("http://maoyan.com/board/{1..8}", {
    films: {
        sels: '.board-item-content *',
        attrs: {
            name: '.name',
            releasetime: '.releasetime',
        }
    }
}).then((x) => {
    x.map(y => console.log(y));
});
//# sourceMappingURL=maoyanboard.js.map