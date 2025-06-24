const { DefaultLogger } = require('./dist/logger/DefaultLogger.js');
const { Logger, createLogger } = require('./dist/logger/Logger.js');
const { NoopLogger } = require('./dist/logger/NoopLogger.js');

module.exports = {
  DefaultLogger,
  Logger,
  createLogger,
  NoopLogger,
  useLogger(logger) {
    Logger.configure({ provider: logger });
  },
};
