import Typheous from "typhoeus"
import { defaults } from "lodash"

export default (epona, opts)=> {
  let callback
  epona.dispatcher = {
    on(path, fn) { callback = fn },
    parse(url, args){ return callback.apply(undefined, args) }
  }
}