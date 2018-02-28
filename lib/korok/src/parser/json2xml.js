const sanitizer = require('./sanitize')

export class Json2Xml {
  constructor(options = {}) {
    options.sanitize = true
    this.options = options
    this.xml = ''
    this.tagIncomplete = false
    this.indents = 0
  }

  parse(obj, isRoot) {
    if(!isRoot) {
      for(let key in obj) {
        let value = obj[key]
        let isArray = Array.isArray(value)
        let type = typeof(value)
        if(type == 'string' || type == 'number' || type == 'boolean') {
          let it = isArray ? value : [value]
          for(let subVal of it) {
            if (typeof(subVal) != 'object') {
              this.addAttr(key, subVal)
            }
          }
        } 
      }
    }

    for(let key in obj) {
      if (Array.isArray(obj[key])) { 
        for(let elem of obj[key]) {
          if (typeof(elem) != 'object') { 
            this.openTag(key)
            this.addTextContent(elem)
            this.closeTag(key)
          } else {
            this.openTag(key)
            this.parse(elem)
            this.closeTag(key)
          }
        }
      } else if (typeof(obj[key]) == 'object') {
        this.openTag(key)
        this.parse(obj[key] || '')
        this.closeTag(key)
      } else if(isRoot) {
        this.openTag(key)
        this.addTextContent(obj[key] || '')
        this.closeTag(key)
      }
    }

    return this.xml
  }

  indent() {
    return Array(this.indents).join('  ');
  }

  openTag(key) {
    this.completeTag()
    ++this.indents
    if(this.options.indent) { this.xml += "\n" + this.indent() }
    this.xml += '<' + key
    this.tagIncomplete = true
  }

  addAttr(key, val) {
    if (this.options.sanitize) { val = sanitizer.sanitize(val) }
    this.xml += ' ' + key + '="' + val + '"'
  }

  addTextContent(text) {
    this.completeTag()
    this.xml += text
  }

  closeTag(key) {
    this.completeTag()
    --this.indents
    this.xml += '</' + key + '>'
    if(this.options.indent) { this.xml += "\n" + this.indent() }
  }

  completeTag() {
    if (this.tagIncomplete) {
      this.xml += '>'
      this.tagIncomplete = false
    }
  }

  static parse (json, options) {
    if (json instanceof Buffer) {
      json = json.toString()
    }

    let obj = null
    if (typeof(json) == 'string') {
      try {
        obj = JSON.parse(json)
      } catch(e) {
        throw new Error("The JSON structure is invalid")
      }
    } else {
      obj = json
    }    
    return new Json2Xml(options).parse(obj, true)
  }
}