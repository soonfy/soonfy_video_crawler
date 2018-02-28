import * as request from "request"
import * as charset from 'charset'
import * as jschardet from 'jschardet'
import * as os from 'os'
import { includes, defaultsDeep } from 'lodash'

let decode
if(os.platform() == "win32") {
  let iconv = require("iconv-lite")
  decode = (buffer, encoding) => {
    return iconv.decode(buffer, encoding)
  }
} else {
  let Iconv = require("iconv").Iconv
  decode = (buffer, encoding) => {
    let iconv = new Iconv(encoding, 'UTF-8//TRANSLIT//IGNORE')
    return iconv.convert(buffer).toString()
  }
}

const defaultOpts = {
  method: 'GET',
  timeout: 120000,
  encoding: null,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36'
  }
}

export default async (opts)=>{
  
  let response = await new Promise(function(resolve, reject) {
    // console.log(defaultsDeep(opts, defaultOpts))
    request(defaultsDeep(opts, defaultOpts) , function(err, res, body)
      {
        if(err) {
          reject(err)
        } else {
          let result, buffer = body
          let encoding = charset(res, buffer)
          encoding = encoding || jschardet.detect(buffer).encoding
          // var result = iconv.decode(bufferHelper.toBuffer(),'GBK');
          if(encoding) {
            // console.info("Detecd charset", encoding)
            if(includes(['ascii', 'utf', 'utf8'], encoding)) {
              res.text = buffer.toString()
            } else {
              res.text = decode(buffer, encoding)
            }
          }
          resolve(res)
        }
      })
  })

  return response
}
