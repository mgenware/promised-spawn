var spawnAsync = require('../lib/main');
var assert = require('assert');
var bluebirdPromise = require('bluebird');

function runTestsWithPromise(promise, desc) {
    spawnAsync.setPromise(promise);
    describe(desc, () => {
        it('echo', () => {
            var stdout = '';
            return spawnAsync(['echo', ['test']], {stdout: (data) => stdout += data}).then((res) => {
                assert.equal(res, 0);
                assert.equal(stdout, 'test\n');
            });
        });
    });
}

runTestsWithPromise(GLOBAL.Promise, 'Native Promise');
runTestsWithPromise(bluebirdPromise, 'bluebird Promise');
