'use strict';

const crypto = require('crypto');
const fs = require('fs');
const pathLib = require('path');

module.exports = function(cacheDir, algo) {
  createDir(cacheDir);
  return function(key, ext, prefix) {
    return new FileWrapper(getPath(key, cacheDir, prefix, ext, algo));
  };
};

class FileWrapper {

  clear() {
    return clear(this.path);
  }

  constructor(path) {
    Object.defineProperties(this, {

      path: {
        enumerable: true,
        value: path
      },

      data: {
        enumerable: true,
        get: function() {
          return readData(this.path);
        },
        set: function(data) {
          return writeData(this.path, data);
        }
      }

    });
  }
}


/**
 * Returns a hex string for the given argument.
 *
 * @param {*} data Any JSON.stringify processable data.
 * @param {string} [algo] Algorithm name. Defaults to "sha1".
 * @returns {string} Hex hash.
 */
function createHash(data, algo) {
  return crypto.createHash(algo || 'sha1')
  .update(JSON.stringify(data))
  .digest('hex');
}

/**
 *
 * @param key
 * @param dir
 * @param prefix
 * @param ext
 * @param algo
 * @returns {string}
 */
function getPath(key, dir, prefix, ext, algo) {
  const pre = typeof prefix === 'string' && prefix.length ? prefix + '.' : '';
  return pathLib.join(dir, pre + createHash(key, algo) + '.' + ext);
}

/**
 * Creates a directory if it does not exist. Note that the parent directory
 * must already exist.
 *
 * @param {string} path
 */
function createDir(path) {
  const pStat = stat(path);
  if(!pStat) {
    fs.mkdirSync(path);
    return;
  }

  if(!pStat.isDirectory()) {
    throw new Error('Cannot create cache directory. Path "' + path + '" is a file.');
  }
}

/**
 * Reads contents from a file.
 *
 * @param {string} path
 * @return {string|null}
 */
function readData(path) {
  if(stat(path)) {
    return fs.readFileSync(path).toString();
  }
  return null;
}

/**
 * Writes contents to a file.
 *
 * @param {string} path
 * @param {string} data
 */
function writeData(path, data) {
  fs.writeFileSync(path, data);
  return true;
}

/**
 * Deletes a file.
 *
 * @param path
 */
function clear(path) {
  const pStat = stat(path);
  if(!pStat) {
    return;
  }
  if(!pStat.isFile()) {
    throw new Error('Path "' + path + '" is not a file.');
  }
  fs.unlinkSync(path);
}

/**
 *
 * @param path
 * @returns {*}
 */
function stat(path) {
  try {
    return fs.statSync(path);
  }
  catch(e) {
    return null;
  }
}
