const { DefaultLogger } = require('./dist/logger/DefaultLogger.js');
const { Logger, createLogger } = require('./dist/logger/Logger.js');

module.exports = {
  DefaultLogger,
  Logger,
  createLogger,
  useLogger(logger) {
    Logger.configure({ provider: logger });
  },
};
