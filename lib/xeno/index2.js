import { 
    isString, castArray, concat, assign, cloneDeep, flatten, pick, omit
  , defaults, isFunction, isArray, startsWith
  
} from 'lodash'

import * as compose from 'koa-compose'

class Xeno {
  constructor() {
    // super();

    this.proxy = false
    this.middleware = []
    this.subdomainOffset = 2
    this.env = process.env.NODE_ENV || 'development'
    this.context = Object.create(context)
  }

  toJSON() {
    return pick(this, [
        'subdomainOffset'
      , 'proxy'
      , 'env'
    ])
  }

  inspect() {
    return this.toJSON()
  }

  crawl(urls) {
    let ctx = {}
    ctx.crawled = epona.get
  }

  use(fn) {
    if (typeof fn !== 'function') throw new TypeError('middleware must be a function!')

    // debug('use %s', fn._name || fn.name || '-');
    this.middleware.push(fn)
    return this
  }

  callback() {
    const fn = compose(this.middleware);

    if (!this.listeners('error').length) this.on('error', this.onerror);

    const handleRequest = (req, res) => {
      // res.statusCode = 404;
      const ctx = this.createContext(req, res);
      const onerror = err => ctx.onerror(err);
      const handleResponse = () => respond(ctx);
      onFinished(res, onerror);
      return fn(ctx).then(handleResponse).catch(onerror);
    };

    return handleRequest;
  }

  createContext(req, res) {
    const context = Object.create(this.context);
    const request = context.request = Object.create(this.request);
    const response = context.response = Object.create(this.response);
    context.app = request.app = response.app = this;
    context.req = request.req = response.req = req;
    context.res = request.res = response.res = res;
    request.ctx = response.ctx = context;
    request.response = response;
    response.request = request;
    context.originalUrl = request.originalUrl = req.url;
    context.cookies = new Cookies(req, res, {
      keys: this.keys,
      secure: request.secure
    });
    request.ip = request.ips[0] || req.socket.remoteAddress || '';
    context.accept = request.accept = accepts(req);
    context.state = {};
    return context;
  }


  onerror(err) {
    // assert(err instanceof Error, `non-error thrown: ${err}`);

    // if (404 == err.status || err.expose) return;
    if (this.silent) return;

    const msg = err.stack || err.toString();
    console.error();
    console.error(msg.replace(/^/gm, '  '));
    console.error();
  }


}