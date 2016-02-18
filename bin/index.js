"use strict";
// IMPORTS
// ================================================================================================
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var objectPath = require('object-path');
// MODULE VARIABLES
// ================================================================================================
var settings;
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
        var configDir = getConfigDir();
        if (!configDir)
            throw new Error('config directory could not be found');
        var file = path.join(configDir, DEFAULTS.env) + '.json';
        console.info('Reading configuration from ' + file);
        var obj = JSON.parse(fs.readFileSync(file, 'utf8').toString());
        // create new settings object
        settings = Object.assign({}, DEFAULTS, obj);
        // decrypt secrets
        var key = settings.env === 'development' || settings.env === 'staging'
            ? settings.env
            : process.env.SECRET_KEY;
        file = path.join(configDir, DEFAULTS.env) + '.secrets';
        console.info('Reading secrets from ' + file);
        var secrets = JSON.parse(decryptFile(file, key));
        // set secrets in settings object
        for (var prop in secrets) {
            objectPath.set(settings, prop, secrets[prop]);
        }
    }
    catch (err) {
        err.message = 'Failed to read config file: ' + err.message;
        throw err;
    }
    return settings;
}
exports.getSettings = getSettings;
// HELPER FUNCTIONS
// ================================================================================================
function getConfigDir() {
    var basePath = process.cwd();
    var subPath = process.env.CONFIG_DIR || 'config';
    var configDir = path.join(basePath, subPath);
    var i = 0;
    while (i < 100) {
        try {
            fs.accessSync(configDir);
            return configDir;
        }
        catch (error) {
            let newBase = path.join(basePath, '..');
            if (newBase === basePath)
                return undefined;
            basePath = newBase;
            configDir = path.join(basePath, subPath);
        }
        i++;
    }
}
function decryptFile(src, key) {
    var contents = fs.readFileSync(src).toString();
    var decipher = crypto.createDecipher('aes-256-cbc', key);
    var decrypted = decipher.update(contents, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
//# sourceMappingURL=index.js.map