"use strict";
// IMPORTS
// ================================================================================================
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const objectPath = require('object-path');
const stripComments = require('strip-json-comments');
// MODULE VARIABLES
// ================================================================================================
var settings;
// EXPORTED FUNCTIONS
// ================================================================================================
function getSettings() {
    // if config settings have already been read, just return them
    if (settings)
        return settings;
    // otherwise, read remaining settings from the configuration file
    try {
        const env = process.env.NODE_ENV || 'development';
        const configDir = getConfigDir();
        if (!configDir)
            throw new Error('config directory could not be found');
        const configFile = path.join(configDir, env) + '.json';
        console.info('Reading configuration from ' + configFile);
        const configContent = fs.readFileSync(configFile, 'utf8').toString();
        settings = JSON.parse(stripComments(configContent));
        settings.env = env;
        // decrypt secrets
        const key = (settings.env === 'production' ? process.env.SECRET_KEY : settings.env);
        const secretsFile = path.join(configDir, env) + '.secrets';
        console.info('Reading secrets from ' + secretsFile);
        const secrets = JSON.parse(decryptFile(secretsFile, key));
        // set secrets in settings object
        for (let prop in secrets) {
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