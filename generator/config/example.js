'use strict';

/**
 * Shared configuration for the build. All file paths are relative to the
 * working directory.
 *
 * Options:
 * - output: Required. Output directory relative to the working directory.
 * - cache: Required. Directory for temporary files and cached data.
 */
exports.common = {
  // Output directory.
  output: 'build',
  // File cache directory.
  cache: '.cache',
};

/**
 * Build sources provide different ways of getting content into your final
 * build. See lib/source-plugins for available plugins.
 */
exports.sources = {};

/**
 * Each source compiles to an Assemble collection, with the property key
 * becoming the collection name. Output paths are by convention relative
 * to the output directory. Be sure to check a plugin's docs for details.
 *
 * Options:
 * - type: Required. The source plugin type.
 * - options: Required. Plugin specific options. For a list of available
 *   configuration options see the plugin documentation.
 */
exports.sources.myPages = {
  type: 'guide',
  options: {
    base: 'my-pages',
    src: 'my-pages/**/*.md',
    dest: './'
  }
};

/**
 * Global menus that render on all pages.
 */
exports.menus = {};

/**
 * Each menu is an array of menu link
 * options. Note that the specific menus required depend on the theme.
 *
 * Menu link options:
 * - label: Required. The link text.
 * - path: Required. The link href.
 * - icon: FontAwesome icon name, without the prefix.
 *   See http://fontawesome.io/icons/ for a list of available icons.
 */
exports.menus.main = [
  { label: 'Home', path: '/', icon: 'home' },
  { label: 'About Us', path: '/about'},
  { label: 'Github', path: 'https://github.com/octocat/hello-worId', icon: 'github' }
];
