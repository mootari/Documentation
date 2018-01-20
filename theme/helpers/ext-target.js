const pattern = /^(?:https?:)?\/\//;

/**
 * Returns `target="_blank"` for external paths.
 *
 * @param {string} path
 * @returns {string}
 */
module.exports = function(path) {
  return pattern.test(path) ? 'target="_blank"' : '';
};
