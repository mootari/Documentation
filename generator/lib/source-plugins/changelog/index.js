'use strict';

/**
 * BJSD source plugin. Fetches releases from Github and renders their combined
 * release notes to a single page.
 */

const axios = require('axios');
const extname = require('gulp-extname');
const pathLib = require('path');
const pluginRenderMarkdown = require('../../plugins/render-markdown');
const {slugify} = require('markdown-toc');

const apiPaths = {
  // releases: 'https://api.github.com/repos/:owner/:repo/releases',
  taggedrelease: 'https://api.github.com/repos/:owner/:repo/releases/tags/:tag'
};

module.exports = function(name, options) {

  return function run(app) {

    const defaults = {
      owner: null,
      repo: null,
      tags: [],
      dest: null,
      frontmatter: {}
    };
    const opts = Object.assign({}, defaults, options);
    const outDir = app.option('build.common.output');

    const collection = app.create(name, {
      engine: 'hbs',
      layout: 'releases'
    });
    const filename = 'index.md';
    const view = collection.addView(filename, {
      path: filename,
      content: '',
      data: Object.assign({}, opts.frontmatter, {releases: []})
    });

    const addTask = app.taskNamespace(name);

    const releases = opts.tags.map(tag => {
      const [name, data] = Array.isArray(tag) ? tag : [tag, {}];
      return Object.assign({}, data, {
        tag_name: name,
        source: replaceTokens(apiPaths.taggedrelease, {
          owner: opts.owner,
          repo: opts.repo,
          tag: name
        })
      });
    });

    /**
     * Task: load:{name}
     *
     * Fetches and parses releases, populates collection.
     */
    addTask(':load', ['common:load'], function() {
      const promises = releases.map(release => {
        return axios.get(release.source)
        .then(response => Object.assign({}, response.data, release));
      });

      return Promise.all(promises).then(releases => {
        if(releases.length) {
          const list = view.data.releases;
          list.push.apply(list, releases.filter(r => r));
        }
      });
    });

    /**
     * Task: build:{name}
     *
     * Renders Markdown, compiles and merges TOC, renders files.
     */
    addTask(':build', [':load'], function() {
      const tocOptions = { min: 1, max: 4 };
      const mdOptions = { html: true, breaks: true, linkify: true };
      const mdPlugins = [indentHeadings(1)];
      const tocs = [];

      view.data.releases.forEach(r => {
        // Some releases may have empty names. Set tag name as fallback.
        if(!r.name.length) {
          r.name = r.tag_name;
        }
        const prefix = slugify(r.tocPrefix || r.name);
        const opts = Object.assign({}, tocOptions, {prefix: prefix + ' '});
        const render = pluginRenderMarkdown.rendererToc(mdOptions, mdPlugins, opts);

        r.toc_slug = prefix;
        r.body = render(r.body, r);
        tocs.push({
          slug: r.toc_slug,
          content: r.name,
          children: r.toc
        });
      });

      view.data.toc = [].concat.apply([], tocs);

      return collection.toStream()
        .pipe(app.renderFile())
        .pipe(extname())
        .pipe(app.dest(pathLib.join(outDir, opts.dest)));
    });

  };
};

/**
 * Remarkable plugin. Increases heading levels by the specified delta.
 *
 * @param delta
 * @returns {Function}
 */
function indentHeadings(delta) {
  return function(md) {
    md.core.ruler.push('change_heading', function(state) {
      // Increases each heading level by one.
      state.tokens.forEach(tok => {
        if(tok.type === 'heading_open' || tok.type === 'heading_close') {
          tok.hLevel += delta;
        }
      });
    })
  }
}

function replaceTokens(str, data) {
  return Object.keys(data)
    .reduce((str, name) => str.replace(':' + name, data[name]), str);
}
