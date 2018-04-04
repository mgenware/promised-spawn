'use strict';
var SPAWN = require('child_process').spawn;
var PROMISE = GLOBAL.Promise;

function setPromise(promise) {
  PROMISE = promise || PROMISE;
}

function spawnAsync(spawnArgs, options) {
  options = options || {};
  return new PROMISE((resolve, reject) => {
    var process = SPAWN.apply(undefined, spawnArgs);
    if (options.stdout) {
      process.stdout.on('data', (data) => {
        options.stdout(data);
      });
    }
    if (options.stderr) {
      process.stderr.on('data', (data) => {
        options.stderr(data);
      });
    }

    process.on('close', (code) => {
      if (code == 0) {
        resolve(0);
      } else {
        let error = new Error(`Process exited with code ${code}`);
        error.code = code;
        reject(error);
      }
    });
  });
}

spawnAsync.setPromise = setPromise;
module.exports = spawnAsync;