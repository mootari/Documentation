'use strict';

/**
 * Collection plugin.
 *
 * @returns {Function}
 */
module.exports = function () {
  return function(collection) {
    collection.onLoad(/./, function(file, next) {
      if(!file.data.layout) {
        file.data.layout = collection.options.layout;
      }
      next();
    });
  }
};
