"use strict";
// IMPORTS
// ================================================================================================
var fs = require('fs');
var path = require('path');
// MODULE VARIABLES
// ================================================================================================
var settings;
var configDir = process.env.CONFIG_DIR || path.join(process.cwd(), 'config');
var DEFAULTS = {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    shard: process.env.SHARD_ID || 1,
    errors: {
        startUpErrorExitCode: 1,
        shutDownTimeout: 3000
    }
};
// EXPORTED FUNCTIONS
// ================================================================================================
function getDefaults() {
    return DEFAULTS;
}
exports.getDefaults = getDefaults;
function getSettings() {
    // if config settings have already been read, just return them
    if (settings)
        return settings;
    // otherwise, read remaining settings from the configuration file
    try {
        var file = path.join(configDir, DEFAULTS.env) + '.json';
        console.info('Reading configuration from ' + file);
        var obj = JSON.parse(fs.readFileSync(file, 'utf8').toString());
    }
    catch (err) {
        err.message = 'Failed to read config file: ' + err.message;
        throw err;
    }
    // create new settings object
    settings = Object.assign({}, DEFAULTS, obj);
    return settings;
}
exports.getSettings = getSettings;
//# sourceMappingURL=index.js.map