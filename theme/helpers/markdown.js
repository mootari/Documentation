const hljs = require('highlight.js');
const Remarkable = require('remarkable');
const striptags = require('striptags');
const defaults = {
  html: true,
  breaks: true,
  highlight: highlight,
  langPrefix: 'hljs lang-'
};

module.exports = function(options) {
  const opts = Object.assign({}, defaults, options || {});
  const md = new Remarkable(opts);
  // md.renderer.rules.heading_open = function(tokens, idx, options, env) {
  //   const content = striptags(md.renderer.renderInline(tokens[idx + 1].children, options, env));
  //   return '<h' + tokens[idx].hLevel + ' class="test">';
  // };

  const render = function(options) {
    const val = options.fn();
    return md.render(val);
  };
  return render;

};

function highlight(code, lang) {
  try {
    try {
      return hljs.highlight(lang, code).value;
    } catch (err) {
      if (!/Unknown language/i.test(err.message)) {
        throw err;
      }
      return hljs.highlightAuto(code).value;
    }
  } catch (err) {
    return code;
  }
}
