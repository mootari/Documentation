'use strict';

const pathLib = require('path');

/**
 * Collection plugin.
 *
 * Backwards compatibility helper. Cuts out the middle part of a three-part
 * filename. Example:
 *   "features/component/Animations.md" => "features/Animations.md"
 */
module.exports = function() {
  return function(collection) {
    collection.onLoad(/./, function(file, next) {
      // For articles, cut out the category part of the path.
      // @todo Remove once the new path schema is implemented.
      const parts = pathLib.relative(file.base, file.path).split(pathLib.sep);
      if(parts.length === 3) {
        file.path = pathLib.join(file.base, parts[0], parts[2]);
      }
      next();
    });
  };
};
