const path = require('path');

module.exports = function override(config) {
  // Force htmlparser2 to use CommonJS version instead of ESM
  config.resolve.alias = {
    ...config.resolve.alias,
    'htmlparser2/lib/esm': path.resolve(__dirname, 'node_modules/htmlparser2/lib'),
    'htmlparser2': path.resolve(__dirname, 'node_modules/htmlparser2/lib')
  };

  return config;
};
