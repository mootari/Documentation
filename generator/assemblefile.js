'use strict';

// Uncomment to get additional debug output.
// require('debug').enable(['router', 'base:engines', 'base:routes', 'base:helpers', 'base:cli', 'base:assemble']);
// Alternatively pass a wildcard enables all debug output.
// require('debug').enable('*');

const pathLib = require('path');


module.exports = function(app) {

  app.use(require('./lib/plugins/config-loader')('build', 'config-path', {
    common: {},
    sources: {},
    menus: {}
  }));

  const baseDir = app.cwd;
  const outDir = pathLib.resolve(baseDir, app.option('build.common.output'));
  app.option('build.common.output', outDir);

  app.use(require('./lib/plugins/run-once')());
  app.use(require('./lib/plugins/task-index')());
  app.use(require('./lib/plugins/task-namespace')());
  app.use(require('./lib/plugins/file-cache')());

  const addTask = app.taskNamespace('common');

  app.data('menu', app.option('build.menus'));

  app.preRender(/\.md$/, function(file, next) {
    file.data = Object.assign({}, app.data.get(), file.data);
    next();
  });

  app.use(function(app) {
    const themePath = pathLib.resolve(baseDir, app.option('build.common.theme'));
    const Theme = require(themePath);
    app.define('theme', new Theme(app));
  });

  /**
   *
   */
  app.task('clean', function(next) {
    require('rimraf')(outDir, next);
  });

  /**
   *
   */
  app.task('assets', function(next) {
    const paths = app.option('build.common.assets');
    Object.keys(paths).forEach(key => {
      const source = pathLib.join(baseDir, key);
      const target = pathLib.join(outDir, paths[key]);
      app.copy(source, target);
    });

    next();
  });

  /**
   * Shared load task for all sources.
   */
  addTask(':load', function(next) {
    return app.theme.initialize();
  });

  // Shared build task for all sources.
  addTask(':build', [ ':load', 'assets'], function(next) {
    return app.theme.render(outDir);
  });

  app.task('default', ['help']);

  initSourcePlugins(app, app.option('build.sources'), {
    api:       require('./lib/source-plugins/api'),
    changelog: require('./lib/source-plugins/changelog'),
    guide:     require('./lib/source-plugins/guide')
  });

};

/**
 *
 * @param app
 * @param sources
 * @param plugins
 */
function initSourcePlugins(app, sources, plugins) {
  const base = app.option('build.common.output');

  // Initialize sources.
  Object.keys(sources).forEach(name => {
    const source = sources[name];
    const plugin = plugins[source.type];
    if(!plugin) {
      throw new Error('Invalid plugin type "' + source.type + '".');
    }
    app.use(plugin(name, source.options || {}));
  });

}
