const {inspect} = require('util');

// HTML escapes a string.
const escape = (function() {
  // HTML escape characters.
  const charMap = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&#39;'
  };
  // Matches any character in charMap.
  const pattern = new RegExp(Object.keys(charMap).join('|'), 'g');
  // String.replace callback.
  const replace = char => charMap[char];

  return str => str.replace(pattern, replace);
}());

// <pre> output style.
const css = (function() {
  const styles = {
    'background': '#fdd',
    'color': '#000',
    'font-size': '14px',
    'padding': '1em',
    'margin': '1em',
    'border': '2px solid red'
  };

  // Convert to a CSS inline style string.
  return escape(Object.keys(styles)
    .map((key) => `${key}:${styles[key]}`)
    .join(';')
  );
}());

/**
 * Returns an HTML dump of the provided object.
 *
 * @param {*} value
 * @returns {string}
 */
module.exports = function dump(value) {
  const output = escape(inspect(value));
  return `<pre style="${css}">${output}</pre>`;
};
