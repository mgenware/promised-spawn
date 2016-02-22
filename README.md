# promised-spawn

[![npm version](https://badge.fury.io/js/promised-spawn.svg)](https://badge.fury.io/js/promised-spawn)
[![Build Status](https://travis-ci.org/mgenware/promised-spawn.svg?branch=master)](http://travis-ci.org/mgenware/promised-spawn)

`child_process.spawn` with Promise, requires Node.js 4.0 or higher.

## Installation
```sh
npm install promised-spawn --save
```

## API
```js
var spawnAsync = require('promised-spawn');
```

### spawnAsync(originalSpawnArguments, options)
* `originalSpawnArguments` should be an array, which will be passed to `child_process.spawn`. See [official docs of child_process.spawn](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)
* `options` available options:
  * `stdout` callback function to redirect stdout.
  * `stderr` callback function to redirect stderr.
  
Example calling `echo`.
```js
var spawnAsync = require('promised-spawn');

var stdout = '';
spawnAsync(['echo', ['hello']], {stdout: data => stdout += data}).then(retCode => {
    console.log(`Process exited with code ${retCode}`);
    console.log(`stdout: ${stdout}`);
});
```

Output
```
Process exited with code 0
stdout: hello
```

Example calling `grep` with error.
```js
var spawnAsync = require('promised-spawn');

var stderr = '';
spawnAsync(['grep', ['find', '_no_such_file_']], {stderr: data => stderr += data}).then(() => {
    console.log('Process succeeded');
}).catch(err => {
    console.log(`Process failed with code ${err.code}`);
    console.log(`stderr: ${stderr}`);
});
```

Output
```
Process failed with code 2
stderr: grep: _no_such_file_: No such file or directory
```
