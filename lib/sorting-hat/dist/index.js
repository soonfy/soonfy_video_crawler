"use strict";
const router_1 = require("./src/router");
const lexer_1 = require("./src/lexer");
class SortingHat {
    constructor() {
        this.routes = [];
    }
    on(pattern, callback, priority = 0) {
        let lexer = new lexer_1.default;
        let route = new router_1.default(pattern, callback, priority, { lexer });
        let l = this.routes.length;
        do {
            --l;
        } while (this.routes[l] && route.priority <= this.routes[l].priority);
        this.routes.splice(l + 1, 0, route);
    }
    parse(request, defaultArgs = []) {
        let routes = this.getMatchedRoutes(request);
        if (routes.length > 1) {
            return Promise.all(routes.map((r) => {
                return r.route.matched.dispatch.apply(r.route.matched, defaultArgs.concat(r.params));
            }));
        }
        else if (routes.length == 1) {
            let r = routes[0];
            return r.route.matched.dispatch.apply(r.route.matched, defaultArgs.concat(r.params));
        }
    }
    getMatchedRoutes(request) {
        let res = [];
        let routes = this.routes;
        this.routes.map((route) => {
            if (route.match(request)) {
                res.push({ route, params: route.getParamsArray(request) });
            }
        });
        return res;
    }
    toString() {
        return `[SortingHat numRoutes: ${this.routes.length} ]`;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SortingHat;
//# sourceMappingURL=index.js.map