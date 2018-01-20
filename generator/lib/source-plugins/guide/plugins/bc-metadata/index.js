'use strict';

const mm = require('micromatch');
const parseInventory = require('./statics-inventory');
const pathLib = require('path');

/**
 * Collection plugin.
 *
 * @param metadataSrc
 * @param base
 * @param globSrc
 * @returns {Function}
 */
module.exports = function(metadataSrc, base, globSrc) {
  return function(collection) {
    const inventory = collection.inventory = parseInventory(metadataSrc, base);
    removeExcluded(inventory, globSrc);

    // Add metadata to views.
    collection.onLoad(/./, function(file, next) {
      const data = inventory.get(file.path);
      if(data) {
        Object.assign(file.data, data, file.data);
      }
      next();
    });

  }
};

function removeExcluded(inventory, globSrc) {
  // Map original to relative paths.
  const cwd = process.cwd();
  const filenames = Array.from(inventory.keys());
  const fileMap = new Map(filenames.map(filename => [
    filename,
    pathLib.relative(cwd, filename)
  ]));

  const included = new Set(mm(Array.from(fileMap.values()), globSrc));
  const iterator = inventory.keys();
  for(const filename of iterator) {
    const relative = fileMap.get(filename);
    if(!included.has(relative)) {
      inventory.delete(filename);
    }
  }
}
