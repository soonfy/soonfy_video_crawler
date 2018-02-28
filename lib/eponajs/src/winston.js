import * as winston from "winston"
export default function(epona, opts = {}) {
  let myCustomLevels = {
    levels: { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 },
    colors: { error: 'red', warn: 'yellow', info: 'green', verbose: 'cyan', debug: 'blue', silly: 'white' }
  }

  epona.logger = new (winston.Logger)({
    // levels: myCustomLevels.levels,
    transports: [
      new (winston.transports.Console)({colorize: true}),
      // new (winston.transports.File)({ filename: 'somefile.log' })
    ],
    colorize: true
  })
  winston.addColors(myCustomLevels.colors);
  epona.logger.level = opts.logLevel || "info"
}