var spawnAsync = require('../lib/main');
var assert = require('assert');
var bluebirdPromise = require('bluebird');

function runTestsWithPromise(promise, desc) {
    spawnAsync.setPromise(promise);
    describe(desc, () => {
        it('echo: retCode 0, stdout', () => {
            var stdout = '';
            return spawnAsync(['echo', ['test']], {stdout: data => stdout += data}).then(res => {
                assert.equal(res, 0);
                assert.equal(stdout, 'test\n');
            });
        });

        it('grep: retCode 2, stderr', () => {
            var stderr = '';
            return spawnAsync(['grep', ['find', '_no_such_file_']], {stderr: data => stderr += data}).then(() => {
                assert(0, 'Process should exit with code 2');
            }).catch(err => {
                assert.equal(err.code, 2);
                assert(stderr);
            });
        });
    });
}

runTestsWithPromise(GLOBAL.Promise, 'Native Promise');
runTestsWithPromise(bluebirdPromise, 'bluebird Promise');
