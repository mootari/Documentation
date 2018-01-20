'use strict';

const parseRedirects = require('./lib/redirects');
const markdownPages = require('./lib/markdown_pages');
const {realpathSync, existsSync} = require('fs');

const toArray = str => str.split(/\s+/).filter(str => str.length);

const toBool = str => {
  const map = {'true': true, 'false': false, '1': true, '0': false};
  const val = str.toLowerCase();
  return map.hasOwnProperty(val) ? map[val] : false;
};

const toPath = (label, path) => {
  try {
    return realpathSync(path);
  }
  catch(e) {
    console.error(label + ' path not found: "' + path + '"');
    process.exit();
  }
};

const dirContent = toPath('Content', process.env.npm_package_config_content);
const dirStatics = toPath('Metadata', process.env.npm_package_config_metadata);
const dirRedirects = toPath('Redirects', process.env.npm_package_config_redirects);

const excludePatterns = toArray(process.env.npm_package_config_exclude);
const linkSources = toArray(process.env.npm_package_config_linksources);
const linkTarget = process.env.npm_package_config_linktarget;

const dryRun = toBool(process.env.npm_package_config_dryrun);

const statics = markdownPages({
  files: dirContent,
  ignoreFiles: excludePatterns,
  metadata: dirStatics,
  redirects: parseRedirects(dirRedirects, {
    ignoreCase: true,
    logger: console
  }),
  replaceLinks: true,
  linkSources: linkSources,
  linkTarget: linkTarget,
  dryRun: dryRun,
  logger: console
});
