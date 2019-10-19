import debug from 'debug'
const appName = 'bggCA'

// debug.enable('bggCA')

export const logger = debug(appName)
export const extendLogger = logger.extend.bind(logger)
