const development = require('./dist/cli/development.js');
const production = require('./dist/cli/production.js');
const env = require('./dist/cli/env.js');
const cli = require('./dist/cli/init.js');
const compiler = require('./dist/cli/build.js');
const appProcess = require('./dist/cli/app-process.js');
const typeChecker = require('./dist/cli/type-checker.js');
const utilities = require('./dist/cli/common.js');

module.exports = {
  compiler,
  appProcess,
  development,
  production,
  env,
  cli,
  typeChecker,
  utilities,
};
