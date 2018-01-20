const {readFileSync} = require('fs');

const mapLine = function(line) {
  const parts = line.split(/[\t\s]+/).filter(line => line.length);
  if(parts.length === 2) {
    return {source: parts[0], target: parts[1]};
  }
  else if(parts.length) {
    throw new Error('Error parsing line: "' + line + '"');
  }
  return null;
};

/**
 * Creates wildcard redirects.
 * For details see https://www.netlify.com/docs/redirects/#splats
 */
const createSplats = function(map, sourceSuffix, targetSuffix) {
  // Splat redirects.
  const splats = new Map();
  // Redirects to be replaced by splats.
  const removals = new Map();

  map.forEach((target, source) => {
    const sourceParts = source.split('/');
    const targetParts = target.split('/');
    if(sourceParts.pop() === targetParts.pop() && sourceParts.length) {
      const splatSource = sourceParts.join('/') + '/' + sourceSuffix;
      const splatTarget = targetParts.join('/') + '/' + targetSuffix;

      if(!splats.has(splatSource)) {
        splats.set(splatSource, splatTarget);
      }
      else if(splats.get(splatSource) === false) {
        // Splat source already has a marked conflict.
        return;
      }
      else if(splats.get(splatSource) !== splatTarget) {
        // Mark splat source as having a conflict.
        splats.set(splatSource, false);
        removals.delete(splatSource);
      }
      if(!removals.has(splatSource)) {
        removals.set(splatSource, []);
      }
      removals.get(splatSource).push(source);
    }
  });

  // Remove replaced redirects from map.
  removals.forEach(sources => {
    sources.forEach(source => {
      map.delete(source);
    });
  });

  // Add generated splats to map.
  splats.forEach((target, source) => {
    if(target !== false) {
      map.set(source, target);
    }
  });
};

module.exports = function(indexFile, options) {
  options = Object.assign({}, {
    ignoreCase: false,
    logger: null,
    //,addSplats: false
  }, options || {});

  const logger = options.logger;

  const map = new Map();
  const data = readFileSync(indexFile).toString();
  const lines = data.split("\n").map(mapLine).filter(line => line);

  if(options.ignoreCase) {
    lines.forEach(line => {
      line.source = line.source.toLowerCase();
      line.target = line.target.toLowerCase();
    });
  }

  lines
    .forEach(line => {
      if(map.has(line.source)) {
        logger && logger.warn('Redirect conflict for source "' + line.source + '"');
        return;
      }
      map.set(line.source, line.target);
    });
  // Resolve intermediate targets.
  map.forEach((target, source) => {
    while(map.has(target)) {
      target = map.get(target);
    }
    map.set(source, target);
  });

  // if(options.addSplats) {
  //   createSplats(map, '*', ':splat');
  // }

  const redirects = new Map();
  map.forEach((target, source) => {
    let sources = redirects.get(target);
    if(!sources) {
      redirects.set(target, sources = []);
    }
    sources.push(source);
  });

  return redirects;
};
