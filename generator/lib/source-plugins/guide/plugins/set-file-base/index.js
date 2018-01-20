'use strict';

/**
 * Collection plugin.
 *
 * @param base
 * @returns {Function}
 */
module.exports = function(base) {
  return function(collection) {
    collection.onLoad(/./, function(file, next) {
      file.base = base;
      next();
    });
  }
};
