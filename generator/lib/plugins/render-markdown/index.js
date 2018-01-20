'use strict';

const Remarkable = require('remarkable');
const markdownToc = require('markdown-toc');
const hljs = require('highlight.js');

const tocDefaults = {
  min: 1,
  max: 3,
  prefix: ''
};

const mdDefaults = {
  html: true,
  breaks: true,
  highlight: highlight,
  linkify: true,

  langPrefix: 'hljs lang-',
  // Custom option, read by plugin function codeDefaultLang.
  langDefault: 'javascript',
};

module.exports = function(options) {
  const defaults = {
    filter: function(file) { return true; },
    toc: tocDefaults,
    pattern: /\.md$/,
    plugins: [],
    markdown: mdDefaults
  };
  const opts = Object.assign({}, defaults, options || {});

  const render = opts.toc
    ? rendererToc(opts.markdown, opts.plugins, opts.toc.min, opts.toc.max)
    : rendererDefault(opts.markdown, opts.plugins);

  return function(collection) {
    collection.preRender(opts.pattern, function(file, next) {
      if(opts.filter(file)) {
        file.content = render(file.content, file.data);
      }
      next();
    });
  };
};

module.exports.mdDefaultOptions = mdDefaults;
module.exports.tocDefaultOptions = tocDefaults;
module.exports.rendererDefault = rendererDefault;
module.exports.rendererToc = rendererToc;

/**
 * Renders markdown.
 *
 * @param mdOptions Markdown options
 * @param mdPlugins
 */
function rendererDefault(mdOptions, mdPlugins) {
  const md = new Remarkable(mdOptions);
  addPlugins(md, [pluginCodeDefaultLang].concat(mdPlugins));
  return md.render.bind(md);
}

/**
 * Renders markdown and generates a table of contents.
 *
 * @param {object} mdOptions Markdown options
 * @param {Function[]} mdPlugins Markdown plugins
 * @param {object} tocOptions
 * @param {int} tocOptions.min
 * @param {int} tocOptions.max
 * @param {string} [tocOptions.prefix]
 * @param {Function} [tocOptions.slugify]
 */
function rendererToc(mdOptions, mdPlugins, tocOptions) {
  const prefix = tocOptions.hasOwnProperty('prefix') ? tocOptions.prefix : '';
  const slugify = typeof tocOptions.slugify === 'function' ? tocOptions.slugify : markdownToc.slugify;
  const mdToc = new Remarkable(mdOptions);
  const pluginToc = markdownToc.plugin({
    slugify: function(str, options) {
      return slugify.call(this, prefix + str, Object.assign({}, options || {}, { slugify: true }));
    }
  });
  addPlugins(mdToc, [pluginToc].concat(mdPlugins));

  const md = new Remarkable(mdOptions);
  addPlugins(md, [pluginCodeDefaultLang, pluginTocHeading].concat(mdPlugins));

  return function(str, data) {
    const toc = mdToc.render(str);
    if(typeof data === 'object') {
      data.toc = prepareToc(toc.json, tocOptions.min, tocOptions.max);
    }
    return md.renderer.render(toc.tokens, md.options);
  };

}

/**
 * Markdown plugin. Sets fallback language for fenced code blocks.
 */
function pluginCodeDefaultLang(md) {
  const rule = md.renderer.rules.fence;
  md.renderer.rules.fence = function(tokens, idx, options, env, instance) {
    if(!tokens[idx].params && md.options.langDefault) {
      tokens[idx].params = md.options.langDefault;
    }
    return rule.call(this, tokens, idx, options, env, instance);
  };
}

/**
 * Markdown plugin. Applies TOC data to a heading.
 */
function pluginTocHeading(md) {
  md.renderer.rules.heading_open = function(tokens, idx) {
    const tok = tokens[idx];
    const tokContent = tokens[idx + 1];

    if(tokContent.slug) {
      const heading = '<h' + tok.hLevel + ' id="' + tokContent.slug + '">';
      const anchor = '<a'
        + ' href="#' + tokContent.slug + '"'
        + ' title="Link to this heading"'
        + ' class="anchor"'
        + ' aria-hidden="true"'
        + '></a>';
      return heading + anchor;
    }
    return '<h' + tok.hLevel + '>';
  };
}

/**
 * Remarkable highlighter, lifted from helper-markdown.
 */
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

/**
 * Nests a flat list of json items from by markdown-toc for simpler processing.
 *
 * @param {object[]} items
 * @param {object[]} items[].lvl
 * @param minDepth
 * @param maxDepth
 * @returns {object[]}
 */
function prepareToc(items, minDepth, maxDepth) {
  const level1 = [];
  const parents = [];

  items.forEach(item => {
    if(item.lvl < minDepth || maxDepth < item.lvl) {
      return;
    }

    parents[item.lvl] = item;
    item.children = [];

    // Find the nearest parent item.
    let i = item.lvl;
    while(--i && !parents[i]) {}
    const parent = parents[i];

    if(!parent || item.lvl === 1) {
      level1.push(item);
    }
    else if(parent.lvl < item.lvl) {
      parent.children.push(item);
    }
    else {
      parents.splice(item.lvl);
    }
  });

  return level1;
}

function addPlugins(md, plugins) {
  plugins.forEach(plugin => md.use(plugin));
}

