'use strict';

const pathLib = require('path');
const cloneDeep = require('clone-deep');

module.exports = function(key, param, defaults) {
  return function run(app) {
    const configPath = app.option(param);

    if(configPath === undefined) {
      throw new Error('Missing configuration parameter --' + param);
    }
    if(typeof configPath !== 'string') {
      throw new TypeError('Expected string, got ' + typeof configPath + '.');
    }

    const path = pathLib.resolve(configPath);
    let config;
    try {
      config = require(path);
    }
    catch(e) {
      throw new Error('Cannot load configuration at path "' + path + '".');
    }

    if(typeof config !== 'object') {
      throw new TypeError('Expected object, got ' + typeof config + '.');
    }

    const opts = Object.assign(cloneDeep(defaults || {}), cloneDeep(config));
    app.option(key, opts);
  };
};
