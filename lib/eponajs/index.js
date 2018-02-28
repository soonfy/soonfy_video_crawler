import request from "./src/request"
import winton from './src/winston'
import sortinghat from './src/sortinghat'
import typhoeus from './src/typhoeus'
import oneroute from "./src/oneroute"
import { Onable } from "./src/onable"
import { iterateUrls } from "./src/utils"
import { 
	defaults,
	castArray,
  isString,
  isArray,
  flatten,
  includes,
  clone,
  isPlainObject
} from "lodash"

function isNeededIterators(baseUrl) {
  let url = baseUrl.url || baseUrl
  let matched = url.match(/{.+?}/g)
  return matched && !matched.map(x=> includes(x, '..')).reduce((x,y)=>{return x && y}, true)
}

class Epona {
	constructor(opts = {}) {
		this.crawledLinks = []
    this.request = request
	}

	queue(urls, opts) {
    let wrapUrl = x=> x.url ? x : {url: x}
    urls = isArray(urls) ? urls.map(wrapUrl) : wrapUrl(urls)
    return this.throttle.queue(urls, opts)
	}

	on(patterns, recipe, opts = {}) {
    // FIXME: follow issue
    opts.filters = {
      follow: (urls)=>{ this.queue(urls); return urls },
      followAndWait: (urls)=> this.queue(urls) 
    }
    let onable = new Onable(this, patterns, recipe, opts)
    return onable
  }

  parse(item) {
    return this.dispatcher.parse(item)
  }

  use(fn, opts) {
    fn(this, opts)
    return this
  }

  get(url, iterators, opts) {
    let urls, acquire
    let wrapUrl = x=> x.url ? x : {url: x}
    if(isPlainObject(url)) { 
      urls = iterateUrls(url.url, iterators) 
      wrapUrl = x=>{ let ret = clone(url);ret.url = x; return ret }
    } else if(isString(url)) {
      urls = iterateUrls(url, iterators)
    } else { urls = url }
    urls = isArray(urls) ? urls.map(wrapUrl) : wrapUrl(urls)
    return this.throttle.queue(urls, opts)
  }

  follow() {

  }

  defaults() {
    request.apply(request, arguments)
    return this
  }

  enableCookie() {
    
  }

  static new(opts = {}) {
    let epona = new Epona(opts)
    epona.use(winton, opts)
    epona.use(sortinghat, opts)
    epona.use(typhoeus, opts)
    return epona
  }

  static dummy(recipe, opts) {
    // if(this._dummy) return this._dummy
    let epona = new Epona(opts)
    epona.use(winton, opts)
    epona.use(typhoeus, opts)
    epona.use(oneroute, opts)        
    // this._dummy = epona
    return new Onable(epona, "*", recipe, opts)
  }

	static get(url, iterators, recipe, opts) {
    if(isArray(url) || !isNeededIterators(url)) { opts = recipe, recipe = iterators}
    let dummy = this.dummy(recipe, opts)
    if(Proxy) {
      let proxy = new Proxy(dummy, {
        get: function(target, name) {
          if (name === 'then') {
            let pms = target.epona.get(url, iterators, opts)
            return pms.then.bind(pms)
          }
          return dummy[name]
        }
      })
      return proxy
    } else {
      return dummy.epona.get(url, iterators, opts)
    }
	}
}

Epona.request = request
module.exports = Epona