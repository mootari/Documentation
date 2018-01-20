'use strict';

module.exports = function(options) {
  return function(app) {

    app.define('taskNamespace', function(namespace) {
      return function(name, deps, fn) {
        if(!fn && typeof deps === 'function') {
          fn = deps;
        }
        if(!Array.isArray(deps)) {
          deps = [];
        }

        deps = deps.map(fullName);
        const full = fullName(name);
        const parent = parentName(name);
        if(!parent) {
          throw new Error('Task "' + name + '" in namespace + "' + namespace + '" is missing prefix ":".');
        }

        app.task(full, deps, fn);
        if(parent && !app.tasks.hasOwnProperty(parent)) {
          app.task(parent, []);
        }
        app.tasks[parent].deps.push(full);
      };

      function fullName(name) {
        return name[0] === ':' ? namespace + name : name;
      }

      function parentName(name) {
        return name[0] === ':' ? name.slice(1) : null;
      }
    });
  };

};