'use strict';

const pathLib = require('path');

class Theme {
  constructor(app) {
    this.app = app;
  }

  initialize(options) {
    this.app.helper('icon-class', require('./helpers/icon-class'));
    this.app.helper('ext-target', require('./helpers/ext-target'));
    this.app.helper('each-map',   require('./helpers/each-map'));
    this.app.helper('raw',        require('./helpers/raw'));
    this.app.helper('dump',       require('./helpers/dump'));

    this.app.layouts(pathLib.join(__dirname, 'templates/layouts/**/*.hbs'));
    this.app.partials(pathLib.join(__dirname, 'templates/partials/**/*.hbs'));

    return Promise.resolve();
  }

  render(outputDir) {
    const assets = {
      'img/**': './img/',
      'js/**': './js/',
    };
    Object.keys(assets).forEach(key => {
      const source = pathLib.join(__dirname, key);
      const target = pathLib.join(outputDir, assets[key]);
      this.app.copy(source, target);
    });

    const sass = require('gulp-sass');
    const sassOptions = {
      outputStyle: 'expanded',
      includePaths: [
        // @todo Is this a ******-*******-ugly hack? You bet it is!
        // - Regarding eyeglass support see https://github.com/sass-eyeglass/eyeglass/issues/149#issuecomment-261046467.
        // - If you plan to update bourbon be prepared to replace all prefixing includes.
        pathLib.resolve(__dirname, '../node_modules/bourbon/app/assets/stylesheets/'),
        pathLib.resolve(__dirname, '../node_modules/bourbon-neat/app/assets/stylesheets/')
      ]
    };

    return this.app.src(pathLib.join(__dirname, 'scss/main.scss'))
    .pipe(sass(sassOptions))
    .pipe(this.app.dest(pathLib.join(outputDir, 'css')));
  }
}

module.exports = Theme;
