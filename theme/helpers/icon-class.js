/**
 * Returns icon classes for an FontAwesome icon name.
 *
 * @param {string} name
 * @returns {string}
 */
module.exports = function(name) {
  return name ? 'fa fa-' + name : '';
};
