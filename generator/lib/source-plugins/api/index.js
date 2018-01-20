'use strict';

/**
 * BJSD source plugin.
 */

const asmUtils = require('assemble/lib/utils');
const axios = require('axios');
const extname = require('gulp-extname');
const td = require('typedoc');
const tdUtils = require('typedoc/dist/lib/utils');
const Renderer = require('./renderer');

// const {Converter} = require('typedoc/dist/lib/converter/converter');

module.exports = function(name, options) {

  return function run(app) {

    const defaults = {
      source: null,
      formatJson: true
    };
    const opts = merge(defaults, options);

    const typedocOptions = {
      name: name,
      includeDeclarations: true,
      excludePrivate: true,
      excludeExternals: true,
      mode: 'modules'
    };

    const collection = app.create(name, {
      engine: 'hbs',
      layout: 'content-article'
    });

    const addTask = app.taskNamespace(name);
    const extNs = name.toLowerCase();
    const fileDts = app.cache(opts.source, 'd.ts', extNs);
    const fileJson = app.cache([fileDts.path, opts], 'json', extNs);

    // // Remove methods and properties that start with "_".
    // app.converter.on(Converter.EVENT_CREATE_DECLARATION, (context, reflection, node) => {
    //   if(node.members) {
    //     node.members.forEach((member) => {
    //       if(member.name && member.name.text[0] === '_') {
    //         // Prevent ClassConverter from creating the member declaration by
    //         // marking the member node as already visited.
    //         // @see Converter.convertNode()
    //         context.visitStack.push(member);
    //       }
    //     });
    //   }
    // });
    //
    // app.generateDocs([config.source], config.target);

    /**
     * Task: purge:{name}
     *
     * Removes cached files.
     */
    addTask(':purge', [':purgeJson'], function(next) {
      fileDts.clear();
      next();
    });

    /**
     * Task: purge:{name}
     *
     * Removes cached JSON file.
     */
    addTask(':purgeJson', function(next) {
      fileJson.clear();
      next();
    });

    /**
     * Task: load:{name}
     */
    addTask(':load', ['common:load'], function() {
      return Promise.resolve()
        // Fetch definitions.
        .then(() => {
          if(!fileDts.data) {
            return axios.get(opts.source).then(response => {fileDts.data = response.data;});
          }
        })
        // Parse definitions to JSON.
        .then(() => {
          // @todo No caching, cannot deserialize back to Reflections.
          // if(fileJson.data) {
          //   return JSON.parse(fileJson.data);
          // }

          const tdOpts = merge(typedocOptions, {logger: loggerBridge(app, name)});
          const tdApp = new td.Application(tdOpts);
          // Add our own customized renderer.
          tdApp.removeComponent('renderer');
          tdApp.addComponent('renderer', Renderer);

          const project = tdApp.convert([fileDts.path]);
          const theme = new td.DefaultTheme(tdApp.renderer, '');
          const urls = theme.getUrls(project);
          // const data = project.toObject();
          //serialijse
          // pruneData(data, ['sources']);
          // fileJson.data = JSON.stringify(data, ...(opts.formatJson ? [null, '\t']: []));
          return data;
        })
        .then(data => {
          const RK = td.ReflectionKind;
          return;
        });
    });

    /**
     * Task: build:{name}
     */
    addTask(':build', [':load'], function(next) {
      next();
    });

  };
};

/**
 * Recursively deletes keys from a TypeDoc data object.
 *
 * @param {object} obj
 * @param {string[]} keys
 */
function pruneData(obj, keys) {
  if(typeof obj !== 'object') {
    return;
  }

  for(let i = keys.length; i--;) {
    if(obj.hasOwnProperty(keys[i])) {
      obj[ keys[i] ] = void 0;
    }
  }

  const props = Object.keys(obj);
  for(let i = props.length; i--;) {
    if(typeof obj[ props[i] ] !== 'object') {
      continue;
    }
    if(!Array.isArray(obj[ props[i] ])) {
      pruneData(obj[ props[i] ], keys);
      continue;
    }
    for(let j = obj[ props[i] ].length; j--;) {
      pruneData(obj[ props[i] ][j], keys);
    }
  }
}

/**
 * Merges option objects into a new object.
 *
 * @param {object} objects
 * @returns {object}
 */
function merge(...objects) {
  return Object.assign({}, ...objects);
}

/**
 * Bridges the TypeDoc Logger to the Assemble logger.
 *
 * @param {Assemble} app
 * @param {string} name Collection name
 * @returns {Function}
 */
function loggerBridge(app, name) {
  const f = asmUtils.log;
  const formats = {
    info:    [f.info,    f.cyan],
    success: [f.success, f.green],
    warning: [f.warning, f.yellow],
    error:   [f.error,   f.red],
    verbose: [f.info,    f.gray]
  };

  const key = f.bold(f.cyan('typedoc') + f.white(':')) + f.yellow(name);

  return function(message, logLevel, newLine) {
    let level = tdUtils.LogLevel[logLevel].toLowerCase();
    const color = formats[level][1];
    app.log.time(level, key, color(formats[level][0]) + ' ' + f.bold(color(message)));
  }
}
