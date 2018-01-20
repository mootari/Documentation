'use strict';

const {readFileSync} = require('fs');

/**
 *
 * @param staticsPath
 * @param contentRoot
 * @returns {Map<any, any>}
 */
module.exports = function(staticsPath, contentRoot) {
  const data = JSON.parse(readFileSync(staticsPath).toString());
  const files = new Map();
  const addItem = (data, filename) => {
    files.set(filename, data);
    if(data.children) data.children.forEach(addItem);
  };

  (new Map(Object.keys(data)
    .map(name => mapSection(data[name], name, contentRoot))
  )).forEach(addItem);

  return files;
};

/**
 * Converts a file name into a page title.
 *
 * @param name
 * @returns {string}
 */
function nameToTitle(name) {
  const delim = ' ';
  return name.replace('_', delim)
    .split(delim)
    .map(word => word.substring(0, 1).toUpperCase() + word.substring(1))
    .join(delim);
}

/**
 * Creates a Map from item children.
 *
 * @param {function} cb Callback, must return [filename, data].
 * @param {array} children
 * @param {*} args Additional arguments
 * @returns {Map<string, object>} Metadata for all children, keyed by filename.
 */
function mapItems(cb, children, ...args) {
  return new Map(children.map(val => {
    return cb.call(children, val, ...args);
  }));
}

/**
 * Compiles metadata for a section and its groups.
 *
 * @param {object[]} items
 * @param {string} name
 * @returns {[{string}, {object}]}
 */
function mapSection(items, name, basePath) {
  // Create a copy and use the first item ("All") as section.
  const children = items.slice();
  const item = children.shift();
  // Make sure we're not accidentally repurposing an item with children.
  if(item.files) {
    throw new Error('Unexpected format for first entry in section "' + sectionName + '".');
  }

  const filename = basePath + '/' + name + '/index.md';
  return [filename, {
    layout: 'content-section',
    title: nameToTitle(name),
    abstract: item.desc || '',
    children: mapItems(mapGroup, children, basePath + '/' + name)
  }];
}

/**
 * Compiles metadata for a group and its articles.
 *
 * @param {object} item
 * @param {string} basePath
 * @returns {[{string}, {object}]}
 */
function mapGroup(item, basePath) {
  const filename = basePath + '/' + item.name + '/index.md';
  return [filename, {
    layout: 'content-group',
    title: item.title,
    abstract: item.desc || '',
    name: item.name || '',
    children: mapItems(mapArticle, item.files, basePath + '/' + item.name)
  }];
}

/**
 * Compiles metadata for an article.
 *
 * @param item
 * @param basePath
 * @returns {[{string}, {object}]}
 */
function mapArticle(item, basePath) {
  const filename = basePath + '/' + item.filename + '.md';
  return [filename, {
    layout: 'content-article',
    title: item.title,
    abstract: item.abstract || '',
    level: item.level || null
  }];
}
