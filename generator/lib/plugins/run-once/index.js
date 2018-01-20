'use strict';

module.exports = function(/* options */) {
  return function(app) {
    app.on('task', app.isBase ? onTaskBase : onTaskEmitter);
  }
};

function onTaskBase(task) {
  if(task.status === 'register') {
    proxy('run', task);
  }
}

function onTaskEmitter(val, task) {
  if(typeof val === 'undefined' && task) {
    proxy('run', task);
  }
}

function proxy(prop, obj) {
  if(typeof obj[prop] !== 'function') {
    throw new TypeError('expected property to be a function');
  }
  const fn = obj[prop];
  const callbacks = [];
  const args = [];
  let started = false;
  let finished = false;
  let result;

  obj[prop] = function(cb) {
    callbacks.push(cb);

    if(!started) {
      started = true;
      result = fn.call(obj, function() {
        finished = true;
        args.push.apply(args, arguments);
        done();
      });
    }
    else if(finished) {
      done();
    }

    return result;
  };

  function done() {
    while(callbacks.length) {
      callbacks.shift().apply(undefined, args);
    }
  }
}
