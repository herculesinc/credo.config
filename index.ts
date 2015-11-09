// IMPORTS
// ================================================================================================
import * as fs from 'fs';
import * as path from 'path';

// MODULE VARIABLES
// ================================================================================================
var settings: Settings;
var configDir: string = process.env.CONFIG_DIR || path.join(process.cwd(), 'config');

var DEFAULTS = {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    errors: {
        startUpErrorExitCode: 1,
        shutDownTimeout: 3000
    }
}

// INTERFACE DEFINITIONS
// ================================================================================================
export interface Settings {
    port: number;
    env: string;
    errors: {
        startUpErrorExitCode: number;
        shutDownTimeout: number;
    };
}

// EXPORTED FUNCTIONS
// ================================================================================================
export function getDefaults() : Settings {
    return DEFAULTS;
}

export function getSettings() : Settings {

    // if config settings have already been read, just return them
    if (settings) return settings;

    // otherwise, read remaining settings from the configuration file
    try {
        var file: string = path.join(configDir, DEFAULTS.env) + '.json';
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