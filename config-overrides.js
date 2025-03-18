const {override, addBabelPlugin} = require('customize-cra');
const moduleResolution = require('./moduleResolution');

module.exports = override(
    // Add support for export * as namespace syntax
    addBabelPlugin('@babel/plugin-proposal-export-namespace-from'),

    // Apply our custom webpack config modifications
    moduleResolution
);
