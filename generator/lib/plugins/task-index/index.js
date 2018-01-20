'use strict';

module.exports = function(options) {
  return function(app) {
    app.task('help', function() {
      app.log('\n  Available tasks:\n');

      const tasks = Object.keys(app.tasks);
      tasks.sort();
      tasks.forEach(task => {
        listItem(task, 1);
        listDeps(app.tasks[task].deps, 1);
      });

      app.log('\n');
    });

    function listItem(text, indent) {
      app.log('  '.repeat(indent || 0) + '- ' + text);
    }

    function listDeps(deps, parentIndent) {
      deps.forEach(dep => listItem(dep, (parentIndent || 0) + 1));
    }

  }
};
