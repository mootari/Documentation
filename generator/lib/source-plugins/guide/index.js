'use strict';

const pathLib = require('path');

const pluginApplyDefaultLayouts = require('./plugins/apply-default-layouts');
const pluginBcArticlePaths      = require('./plugins/bc-article-paths');
const pluginBcAddIndexFiles     = require('./plugins/bc-add-index-files');
const pluginBcMetadata          = require('./plugins/bc-metadata');
const pluginRenderMarkdown      = require('../../plugins/render-markdown');
const pluginSetFileBase         = require('./plugins/set-file-base');

const extname = require('gulp-extname');

/**
 * Statics source plugin.
 *
 * "Statics" are authored markdown files with frontmatter. They are grouped
 * into sections and categories.
 */
module.exports = function(name, options) {

  return function run(app) {
    // See https://github.com/assemble/assemble/issues/947
    const cwd = process.cwd();
    const contentRoot = pathLib.resolve(cwd, options.base || './');
    const addTask = app.taskNamespace(name);
    const outDir = app.option('build.common.output');

    const collection = app.create(name, {
      engine: 'hbs',
      layout: 'content-article'
    });

    addTask(':load', ['common:load'], function(next) {
      // Enforce contentRoot as file base. Required when only a subdirectory is
      // targeted by options.src.
      collection.use(pluginSetFileBase(contentRoot));

      if(options.metadata) {
        collection.use(pluginBcMetadata(options.metadata, contentRoot, options.src));
      }

      collection.use(pluginApplyDefaultLayouts());
      collection.use(pluginBcArticlePaths());
      collection.use(pluginRenderMarkdown({
        filter: view => view.data && view.data.layout === 'content-article'
      }));

      // Add content files.
      collection.addViews(options.src);
      // Ensure that missing index files are created. This plugin must be added
      // after any existing files have been added to the collection.
      collection.use(pluginBcAddIndexFiles(contentRoot, (filename, data) => data.layout === 'content-section'));

      next();
    });

    addTask(':build', [':load', 'common:build'], function(next) {
      return collection.toStream()
        .pipe(app.renderFile())
        .pipe(extname())
        .pipe(app.dest(pathLib.join(outDir, options.dest)));
    });

  }

};
