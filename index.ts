// IMPORTS
// ================================================================================================
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as objectPath from 'object-path';

// MODULE VARIABLES
// ================================================================================================
var settings: Settings;
var configDir = process.env.CONFIG_DIR || path.join(process.cwd(), 'config');

var DEFAULTS = {
    port    : process.env.PORT || 3000,
    env     : process.env.NODE_ENV || 'development',
    shard   : process.env.SHARD_ID || 1,
    errors  : {
        startUpErrorExitCode: 1,
        shutDownTimeout: 3000
    }
}

// INTERFACE DEFINITIONS
// ================================================================================================
export interface Settings {
    port    : number;
    env     : string;
    shard   : number;
    errors  : {
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

// HELPER FUNCTIONS
// ================================================================================================
function decryptFile(src: string, key: string): string {
    var contents = fs.readFileSync(src).toString();
    var decipher = crypto.createDecipher('aes-256-cbc', key);
    var decrypted = decipher.update(contents, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
}