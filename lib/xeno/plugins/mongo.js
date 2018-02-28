import { MongoClient } from 'mongodb'
import { isString, isPlainObject, omit, includes, isArray, defaults } from "lodash"
export default function(xeno, opts) {
  if(isString(opts)) {
    mongo = MongoClient.connect(opts, function(err, mongo){
      xeno._mongo = MongoAdapter(mongo.collection(xeno.name), xeno)
      xeno._adapter = 'mongo'
    })
  } else {
    xeno._mongo = new MongoAdapter(opts.collection(xeno.name), xeno)
    xeno._adapter = 'mongo'
  }
}

let defuncs = ['page', 'per']

// async function docbs(cbs, ops) {
//   if(cbs || cbs.length > 0) {
//     return await Promise.all(ops.map(async(x)=>{
//       let cbret = x
//       for(let cb of cbs) {
//         cbret = await cb(cbret)
//       }
//       return cbret
//     }))
//   }
//   return ops
// }

async function docbs(cbs, arg1, arg2) {
  let cbret = arg1
  if(cbs || cbs.length > 0) {
    for(let cb of cbs) { cbret = await cb(cbret, arg1, arg2) }
  }
  return cbret
}


function uniqQuery(uniqs, doc) {
  let query = {}
  for(let un of uniqs) {
    query[un] = doc[un]
  }
  return query
}

function isOk(ret) {
  return ret.ok == 1
}

function isUpdate(saved) {
  return saved.lastErrorObject.updatedExisting
}

function uniqBy() {

}

function isntUniq(e) {
  return e.name == "MongoError" && e.code == 11000
}

class MongoAdapter {
  constructor(collection, xeno) {
    this.col = collection
    // this.xeno = xeno
    // this.afterSave = xeno._cbs.afterSave
    // this.afterCreate = xeno._cbs.afterCreate
    // this.beforeCreate = xeno._cbs.beforeCreate
    this.xeno = xeno
    this.ty = xeno.ty
  }

  beforeSave(doc) {
    let cbs = this.xeno._cbs.beforeSave
    return docbs(cbs, doc)
  }

  afterCreate(doc) {
    let cbs = this.xeno._cbs.afterCreate
    return docbs(cbs, doc)
  }

  beforeCreate(doc) {
    let cbs = this.xeno._cbs.beforeCreate
    return docbs(cbs, doc)
  }

  afterSave(saved, doc) {
    let cbs = this.xeno._cbs.afterSave
    return docbs(cbs, saved, doc)
  }
  

  uniqQuery(doc) {
    let query = {}
    for(let un of this.xeno._uniqBy) {
      query[un] = doc[un]
    }
    return query
  }

  async findOne(query, options) {
    return this.col.findOne(query, options)
  }

  async insertCover(doc) {
    let cansave = await this.beforeSave(doc)
    if(!cansave) { return false }
    let query = this.uniqQuery(doc)
    let indoc = includes(this.xeno._uniqBy, '_id') ? cansave : omit(cansave, "_id")
    let saved = await this.col.findOneAndUpdate( query
                                               , { $set: indoc, $setOnInsert: {doc: doc._id } }
                                               , { upsert: true
                                                 , returnOriginal: false})
    await this.afterSave(saved, doc)
    if(!isUpdate(saved)) { await this.afterCreate(doc) }
    return isOk(saved) ? saved.value : false
  }

  // TODO: 添加时间戳 $currentDate

  async insertMerge(doc) {
    let cansave = await this.beforeSave(doc)
    if(!cansave) { return false }
    let query = this.uniqQuery(doc)
    let indoc = {}
    // doc = includes(this.xeno._uniqBy, '_id') ? doc : omit(doc, "_id")
    for(let key in cansave) {
      let val = cansave[key]
      if(val != null && val != undefined && val != '') {
        indoc[key] = val
      }
    }
    let saved =  await this.col.findOneAndUpdate( query
                                                , { $set: indoc, $setOnInsert: {cansave: cansave._id } }
                                                , { upsert: true
                                                  , returnOriginal: false})
    await this.afterSave(saved)
    if(!isUpdate(saved)) { await this.afterCreate(doc) }
    return isOk(saved) ? saved.value : false
  }

  async insertHold(doc) {
    let cansave = await this.beforeSave(doc)
    if(!cansave) { return false }    
    let query = this.uniqQuery(doc)
    let founded = await this.col.findOne(query)
    if(founded) {
      await this.afterSave(saved)
      return founded
    } else {
      let saved = await this.col.insertOne(cansave)
      await this.afterSave(saved)
      await this.afterCreate(doc)
      return isOk(saved.result) ? saved.ops[0] : false
    }
  }

  async insertMany(docs, options) {
    if(docs.length == 0) { return docs }
    let cansaves = []
    for(let doc of docs) {
      let cansave = await this.beforeSave(doc)
      if(cansave) { cansaves.push(cansave) }
    }
    // if(await beforeSave(docs) == false) { return docs }
    let ret = await this.col.insertMany(cansaves, options)
    if(isOk(ret.result)) {
      console.log("inserted", cansaves.length, "docs")
      await this.ty.map(ret.ops, async (doc)=>{
        try {
          await this.afterCreate(doc)
          await this.afterSave(doc)
        } catch(e) {
          console.log(e)
        }
      })
      return ret.ops
      // await docbs(this.afterSave, ret.ops)
      // return await docbs(this.afterCreate, ret.ops)
    } else {
      console.log(ret)
    }
  }

  async updateBy(docs, mode) {
    console.log("updated", docs.length, "docs")
    return this.ty.map(docs, async (doc)=>{
      let saved = await this.insertCover(doc)
      return saved
    })    
  }

  async insert(docs, options = {}) {
    let _isArray = isArray(docs)
    if(!_isArray) { docs = [docs] }
    // if(options.ordered !== false) { options.ordered = true }
    let ret
    try {
      ret = await this.insertMany(docs)
    } catch(e) {
      if(isntUniq(e)) {
        ret = await this.updateBy(docs, options)
      } else {
        console.log(e)
        return false
      }
    }
    return (!_isArray && ret.length == 1) ? ret[0] : ret
  }

  async find (match, options) {
    let cursor = this.col.find(match, options)
    if(this._start) {
      cursor = cursor.skip(this._start).limit(this._per || 10)
      this._start = null
    }
    try {
      let proxy = new Proxy(cursor, {
        get: function(target, name) {
          if (name === 'then') {
            let pms = target.toArray()
            return pms.then.bind(pms)
          } else if(defuncs.include(name)) {
            return Reflect.get(this, name)
          }
          return target[name]
        }
      })
      return proxy
    } catch(e) {
      console.log(e)
      return []
    }
  }

  page(_page) {
    this._start = (_page - 1) * (this._per || 10)
    return this
  }

  per(_per) {
    this._per = _per
    return this
  }  

}
