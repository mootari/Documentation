'use strict';

const cache = require('./cache');
const pathLib = require('path');

module.exports = function(options) {
  const opts = Object.assign({
    dir: '.cache',
    algo: 'sha1'
  }, options);

  return function(app) {
    const path = pathLib.resolve(process.cwd(), opts.dir);
    app.define('cache', cache(path, opts.algo));
  };
};
