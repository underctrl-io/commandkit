const { defineConfig } = require('./dist/config/config.js');
const { buildOnly, noBuildOnly } = require('./dist/utils/utilities.js');

module.exports = {
  defineConfig,
  buildOnly,
  noBuildOnly,
};
