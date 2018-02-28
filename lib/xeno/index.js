import { 
    isString, castArray, concat, assign, cloneDeep, flatten, pick, omit
  , defaults, isFunction, isArray, startsWith
  
} from 'lodash'

import mongoAdapter from "./src/mongo"
import xenoproxy from "./src/xenoproxy"
import { ObjectID } from "mongodb"
import Typhoeus from "typhoeus"
import * as Epona from 'eponajs'
import * as pluralize from "pluralize"
import { docbs } from './src/utils'

export function xeno(obj) {
  // new Schame(obj)
  let x = new Xeno(obj)
  return x
}

function type2Mongo() {
  return 'string'
}

function parseSchemaSpec(spec) {
  let specObj = {}
  specObj['sels'] = spec 
  return specObj
}

function name2cn(item) {
  return item
}

function name2type(item) {
  return item
}

function parseSchema() {
  let mongo = {}, uniqles = ['_id'], recipe = {}
  for(let key in schema) {
    let item = schema[key]
    if(isString(item)) { item = parseSchemaSpec(item) }

    if(!item.namecn) { item.namecn = name2cn(key) }
    if(!item.type) { item.type = name2type(key) }

    // uniqle
    if(item.uniqle) {
      uniqles.push(key)
    }

    if(item.ref) {
      refs.push(key)
    }

    mongo[key] = type2Mongo(item)

    if(item.sels) {
      recipe = pick(item, 'sels', 'default', 'join', 'filters', 'attrs')
    }
  }
  return { mongo, uniqles, recipe }
}

export class Xeno {
  constructor(db, name, schema) {
    this.db = db
    this.name = name
    this.objs = {}
    this.ty = new Typhoeus()
    this.recipe = schema || {}
    this.is = {}
    this._done = {}
    this._is = {}
    this._cbs = {
        beforeSave: []
      , afterSave: []
      , afterCreate: []
      , beforeCreate: []
      , afterParse: []
      , beforeParse: []
      , beforeCrawl: []
      , afterCrawl: []
    }
    this._parser = {}
    this.__xeno = true
    this._uniqBy = ['_id']
    this._uniqs = ['_id']
    this._recipes =  {}
    this._refs = {}
    this._defaults = {}
    this._schemas = {
      mongo: {}
    }
    this._adapterName = ''
    this.parseSchema(schema)
    // return xenoproxy(this)
    this.beforeSave(function(doc) {
      return pick(doc, Object.keys(this._schemas.mongo))
    })

    this.beforeCrawl(function(url) {
      if(isString(url)) {
        return { url, default: { }, qs: {} }
      } else {
        if(!url.default) { url.default = {} }
        return url
      }
    })

    this.parseSchema({
      _id: { type: 'string', default: ()=> (new ObjectID()).str }
    })

    return this
  }

  parseSchema(schema) {
    for(let key in schema) {
      let item = schema[key]
      if(isString(item)) { item = parseSchemaSpec(item) }

      if(!item.namecn) { item.namecn = name2cn(key) }
      if(!item.type) { item.type = name2type(key) }

      // uniq
      if(item.uniq) {
        this._uniqs.push(key)
      }

      if(item.ref) {
        this._refs.push(key)
      }

      if(item.default) {
        this._defaults[key] =  item.default
      }

      if(!startsWith(key, '__') || item.notSave != true) {
        this._schemas.mongo[key] = type2Mongo(item)
      }

      if(item.sels) {
        this._recipes[key] = pick(item, 'sels', 'default', 'join', 'filters', 'attrs')
      }
    }
  }

  get mongo() {
    return this._mongo
  }

  get es() {
    
  }

  get epona() {
    if(!this._epona) {
      this._epona = Epona.dummy(this._recipes, this.eponaOpts)
    }
    return this._epona
  }

  // use(fn, opts) {
  //   if(fn == 'mongo') {
  //     this._mongo = mongoAdapter(opts, this)
  //     this._adapter = 'mongo'
  //     // this._mongo = opts
  //     // this._adapter = opts
  //   } else if(fn == 'es') {
  //     // this._es = new ESAdapter(opts)
  //     // this._adapter = this._es
  //   } else if(fn == 'epona') {
  //     this.eponaOpts = opts
  //   } else {
  //     fn(this, opts)
  //   }
  //   return this
  // }

  use(fnOrName, opts) {
    if(isString(fnOrName)) {
      let mode = require(`./plugins/${fnOrName}`).default
      mode(this, opts)
    } else {
      fnOrName(this, opts)
    }
    return this
  }


  get useadapter() {
    return this['_' + this._adapter]
  }

  get schema() {
    return this._schemas[this._adapter]
  }

  get keys() {
    return Object.keys(this.schema)
  }

  pipe() {

  }

  async crawl(urls) {
    let _isArray = isArray(urls)
    let crawled
    if(this._cbs.beforeParse.length > 0) {
      crawled = this.epona.beforeParse((res)=>{
        for(let cb of this._cbs.beforeParse) { res = cb(res) }
        return res
      })
    }

    let urlObjs = []
    for(let url of castArray(urls)) {
      for(let cb of this._cbs.beforeCrawl) { url = cb(url) }
      urlObjs.push(url)
    }

    crawled = await this.epona.epona.get(urlObjs)

    crawled = await this.ty.map(crawled, (cr)=> {
      return docbs(this._cbs.afterParse, cr)
    })

    crawled = (!_isArray && crawled.length == 1) ? crawled[0] : crawled

    if(_isArray) {
      for(let cr of crawled) {
        for(let cb of this._cbs.afterCrawl) { crawled = cb(cr) }
      }
    } else {
      for(let cb of this._cbs.afterCrawl) { crawled = cb(crawled) }
    }

    return crawled
  }

  async insert(objs, opts) {
    let schema = this.schema
    let _isArray = true
    if(!isArray(objs)) { _isArray = false; objs = [objs] }
    let insertObjs = objs.map(obj =>{
      let insertObj = {}
      for(let key in schema) {
        insertObj[key] = obj[key]
        if(!obj[key]
          && this._defaults[key]) {
          insertObj[key] = isFunction(this._defaults[key]) 
                         ? this._defaults[key]() 
                         : this._defaults[key]
        }
      }
      return insertObj
    })
    
    let inserted = await this.adapter.insert(insertObjs, opts)
    return (!_isArray && inserted.length == 1) ? inserted[0] : inserted 
  }

  find(query, opts) {
    return this.adapter.find(query, opts)
  }

  findOne(query, opts) {
    return this.adapter.find(query, opts)
  }

  async push(urlsOrObjs) {
    let crawled = await this.crawl(urlsOrObjs)
    
    let saved = await this.mongo.insert(crawled)

    return saved

  }

  bulk(opts) {
    return this.mongo.bulk(opts)
  }

  sync() {
    
  }

  toAry() {

  }

  toDoc() {
    // 文档
  }

  toCSV() {
    
  }

  toJSON() {
    return this.objs
  }

  map() {

  }

  reduce() {

  }

  find() {
    this._query = this.adapter.find()
  }

  where() {

  }

  defaults(objsOrkey, value) {
    if(value && isString(objsOrkey)) {
     this.parseSchema({
        [objsOrkey]: { default: value }
      })
    } else {
      let parsed = {}
      for(let key in objsOrkey) {
        parsed[key] = { default: objsOrkey[key] }
      }
      this.parseSchema(parsed)
    }
    return this
  }

  timeStamps() {
    if(this._done.timeStamps) return this
    this.parseSchema({
        created_at: {
          type: 'time'
        , default: ()=> new Date()
      }
      , updated_at: {
          type: 'time'
        , default: ()=> new Date()
      } 
    })
    this._done.timeStamps = true
    return this    
  }

  userStamps(opts) {
    if(this._done.userStamps) return this
    this.parseSchema({
        created_by: {
          type: 'string'
        , default: opts.default
      }
      , updated_by: {
          type: 'string'
        , default: opts.default
      } 
    })
    this._done.userStamps = true
    return this
  }  

  saveUrl(name = 'url') {
    this.parseSchema({url:{ type: 'string' }})
    this.beforeCrawl(function(url) {
      // FIXME: 需要把 url 中的 querystring 拼接起来
      if(url.default){ url.default[name] = url.url } 
      else { url.default = { [name]: url.url } }
      return url
    })
    return this
  }

  beforeCrawl(fn) {
    this._cbs.beforeCrawl.push(fn.bind(this))
    return this
  }

  beforeParse(fn) {
    this._cbs.beforeParse.push(fn.bind(this))
    return this
  }

  beforeSave(fn) {
    this._cbs.beforeSave.push(fn.bind(this))
    return this
  }

  afterCrawl(fn) {
    this._cbs.afterCrawl.push(fn.bind(this))
    return this
  }

  afterSave(fn) {
    this._cbs.afterSave.push(fn.bind(this))
    return this
  } 

  afterCreate(fn) {
    this._cbs.afterCreate.push(fn.bind(this))
    return this
  }

  beforeCreate(fn) {
    this._cbs.afterCreate.push(fn.bind(this))
    return this
  }

  afterParse(fn) {
    this._cbs.afterParse.push(fn.bind(this))
    return this
  }
  
  hasMany(field) {
    let fieldName = pluralize.singular(field) + '_id'
    this.recipe[field] = {
        type: 'array'
      , name: field
    }
    // field
    // this.recipe
  }

  default(dtfs) {
    for(let dft in dtfs) {
      this._recipes[dft] = { default: dtfs[dft] }
    }
    return this
  }

  parseMode(mode, opts) {
    this._parser = { mode, opts }
    return this
  }

  uniqBy(fields) {
    this._uniqBy = castArray(fields)
    return this
  }

  _howUniq() {
    this._uniqfn = ()=>{

    }
  }

  mode(fnOrName, opts) {
    if(isString(fnOrName)) {
      let mode = require(`./mode/${fnOrName}`).default
      mode(this, opts)
    } else {
      fnOrName(this, opts)
    }
    return this
  }

  static new() {
    
  }
}