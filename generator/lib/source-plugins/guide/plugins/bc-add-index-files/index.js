'use strict';

module.exports = function bcAddIndexFiles(base, filter) {
  const filterFn = filter || function(filename, data) { return true };

  return function(collection) {
    if(!collection.inventory) {
      throw new TypeError('No inventory index found on collection. Make sure that plugin bc-metadata is loaded.');
    }

    // Structure: [filename, data]
    const candidates = Array.from(collection.inventory)
      // Exclude existing index files.
      .filter(item => !collection.views[ item[0] ])
      .filter(item => filterFn(item[0], item[1]));

    if(candidates.length) {
      // Add missing index files.
      const files = candidates.map(item => ({
        path: item[0],
        content: ' ',
        data: item[1]
      }));
      collection.addViews(files);
    }
  }
};
