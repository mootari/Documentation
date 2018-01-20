const glob = require('glob');
const urlify = require('urlify').create();
const mdify = require('mdify');
const fs = require('fs');

/**
 * Replaces internal links with targets from a link map.
 *
 * @param {Map} linkMap
 * @param {string} content
 * @param {string[]} [suffixes] - Extensions that should not be recognized as file URLs.
 * @param {Console} [logger]
 * @returns {string}
 */
const updateInternalLinks = function(linkMap, content, suffixes, logger) {
  const patternText = '\\[' + '(' + '[^\\]]+?' + ')' + '\\]';
  const patternPath = '\\(' + '(' + '[^) ]+?' + ')' + '\\)';

  const expLinks = new RegExp(patternText + patternPath, 'g');
  const expLocal = /^\/(?!\/)/;

  const patternIllegalExt = suffixes && suffixes.length
    ? '(?!(?:' + suffixes.join('|') + ')$)'
    : '';
  const patternExt = '[a-z]{2,}$';
  const expFile = new RegExp('\.' + patternIllegalExt + patternExt);

  return content.replace(expLinks, (match, text, path) => {
    const [url, fragment] = path.split('#', 2);
    if(!expLocal.test(url) || expFile.test(url)) {
      return match;
    }
    const targetPath = linkMap.get(url.toLowerCase());
    if(targetPath) {
      return '[' + text + '](' + targetPath + (fragment ? '#' + fragment : '') + ')';
    }
    else if(logger) {
      logger.warn('Unregistered internal link: "' + path + '".');
    }
    return match;
  });
};

/**
 * Transliterates a string into a URL-friendly form.
 *
 * @param {string} str
 * @returns {string}
 */
const createSlug = function(str) {
  // Urlify options. See https://www.npmjs.com/package/urlify
  const options = {
    spaces: '-',
    toLower: true,
    trim: true
  };

  const sanitized = str
    // Inject whitespace into camelCase words.
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Inject whitespace before numbers following a letter.
    .replace(/([A-z])([0-9])/g, '$1 $2')
    // // Replace underscores.
    .replace(/[_]/g, '-');

  return urlify(sanitized, options);
};

/**
 * Creates a flat map of source paths to target paths.
 *
 * @param {object} metadataList - getMetadata()
 * @returns {Map<string, string>}
 */
const createLinkMap = function(metadataList, sourceProps, targetProp) {
  const map = new Map();
  metadataList.files.forEach((file) => {
    const target = file[targetProp];
    for(let i = 0; i < sourceProps.length; i++) {
      map.set(file[sourceProps[i]], target);
      map.set(file[sourceProps[i]] + '.html', target);
    }

    if(file.metadata.redirects) {
      file.metadata.redirects.forEach(source => {
        map.set(source.toLowerCase(), target);
      });
    }
  });
  return map;
};

/**
 * Generates a list of files from statics.json.
 *
 * @param {object} index
 * @param {boolean} addIndices
 * @returns {{paths: Map<string, object>, files: Map<string, object>}}
 */
const getMetadata = function(index, addIndices) {
  const files = new Map();
  const paths = new Map();

  Object.keys(index).forEach(sectionName => {
    const groups = index[sectionName].slice();

    // Each first group will act as parent index.
    const section = groups.shift();
    // Make sure we're not accidentally repurposing a section with children.
    if(section.files) {
      throw new Error('Unexpected format for first entry in section "' + sectionName + '".');
    }

    const sectionData = {
      url: ('/' + sectionName).toLowerCase(),
      path: sectionName,
      file: sectionName + '/index.md',
      metadata: {
        title: section.title,
        abstract: section.desc || '',
        slug: createSlug(sectionName)
      }
    };
    sectionData.slug = '/' + sectionData.metadata.slug;

    if(addIndices) {
      // Register a stub index file.
      files.set(sectionData.file, sectionData);
      paths.set(sectionData.url, sectionData);
    }

    groups.forEach(group => {

      const groupData = {
        url: null,
        path: sectionName + '/' + group.name,
        file: sectionName + '/' + group.name + '/index.md',
        metadata: {
          title: group.title,
          abstract: group.desc || '',
          slug: createSlug(group.name)
        }
      };
      groupData.slug = sectionData.slug + '/' + groupData.metadata.slug;

      // Register a stub index file.
      if(addIndices) {
        files.set(groupData.file, groupData);
        paths.set(groupData.url, groupData);
      }

      group.files.forEach(file => {
        const data = {
          url: ('/' + sectionName + '/' + file.filename).toLowerCase(),
          path: sectionName + '/' + group.name + '/' + file.filename,
          file: sectionName + '/' + group.name + '/' + file.filename + '.md',
          metadata: {
            title: file.title,
            abstract: file.abstract || '',
            slug: createSlug(file.filename)
          }
        };
        data.slug = groupData.slug + '/' + data.metadata.slug;
        files.set(data.file, data);
        paths.set(data.url, data);
      });

    });
  });

  return { paths: paths, files: files };
};

/**
 *
 * @param {object} [options]
 * @returns {Map<{string}, {object}>}
 */
module.exports = function(options) {
  options = Object.assign({}, {
    // Directory containing the markdown files.
    files: null,
    // Additional directories to be excluded, relative to files.
    ignoreFiles: null,
    // Path to statics.json.
    metadata: null,
    // Map of parsed redirects, with target as key and an array of sources as
    // value.
    redirects: null,

    // Replace existing internal links.
    replaceLinks: false,
    // Property values that are registered as link sources.
    linkSources: ['slug', 'url'],
    // Property used as link target.
    linkTarget: 'slug',
    contentExtensions: ['html'],
    illegalExtensions: ['md'],
    // Skip writing changes to the file system.
    dryRun: false,
    // Any log interface, e.g. Console.
    logger: null
  }, options);

  const logger = options.logger;

  if(logger && options.dryRun) {
    logger.info('Performing dry run - no changes will be written.');
  }

  const metadata = getMetadata(JSON.parse(
    fs.readFileSync(options.metadata).toString()
  ), true);

  // Add redirects to file metadata.
  options.redirects.forEach((sources, target) => {
    const file = metadata.paths.get(target);
    if(!file) {
      logger && logger.warn('Missing redirect target: "' + target + '"');
      return;
    }
    file.metadata.redirects = sources.slice();
  });

  const globOptions = {cwd: options.files};
  if(options.ignoreFiles) {
    globOptions.ignore = options.ignoreFiles;
  }

  // Update metadata in markdown files.
  const files = glob.sync('**/*.md', globOptions);
  files.forEach(filename => {
    const filePath = options.files + '/' + filename;
    const parsed = mdify.parse(fs.readFileSync(filePath).toString());

    const file = metadata.files.get(filename) || {};
    const data = Object.assign({}, parsed.metadata || {}, file.metadata || {});
    // Clean up whitespace at the beginning of the markdown content.
    let markdown = "\n" + parsed.markdown.trimLeft();

    if(options.replaceLinks) {
      const linkMap = createLinkMap(metadata, options.linkSources, options.linkTarget);

      markdown = updateInternalLinks(linkMap, markdown, logger);
    }
    !options.dryRun && fs.writeFileSync(filePath, mdify.stringify(data, markdown));
    logger && logger.debug('Updated file "' + filePath + '".');
  });

  // Create stub index files.
  const fileIndex = new Set(files);
  metadata.files.forEach(file => {
    if(!fileIndex.has(file.file)) {
      const markdown = '# ' + file.metadata.title + "\n";
      const filePath = options.files + '/' + file.file;
      !options.dryRun && fs.writeFileSync(filePath, mdify.stringify(file.metadata, markdown));
      logger && logger.info('Created file "' + filePath + '".');
    }
  });

  return metadata.files;
};
