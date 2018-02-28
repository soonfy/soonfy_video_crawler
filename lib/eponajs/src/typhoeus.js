import Typheous from "typhoeus"
import { defaults } from "lodash"

export default (epona, opts)=> {
  epona.throttle = new Typheous(defaults(opts, {
    concurrent: 10,
    acquire: (item)=> {
      return epona.dispatcher.parse(item.url, ['acquire'])(item)
    },
    release: (parsedBody, item)=> {
      return epona.dispatcher.parse(item.url, ['release', item])(parsedBody)
    },
    error: (error, item)=>{
      epona.logger.error('------ error msg ------')
      epona.logger.error(`${item.method}: ${item.url}`)
      epona.logger.error(error.message, '\n')
      epona.logger.error('------ stack info ------')
      epona.logger.error(error.stack)
    }
  }))
}