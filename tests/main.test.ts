import * as assert from 'assert';
import spawn, { SpawnOutput, SpawnError, SpawnOptions } from '../dist/main.js';

function checkOutput(output: SpawnOutput, stdout: string, stderr: string, merged: string) {
  assert.strictEqual(output.stdout, stdout);
  assert.strictEqual(output.stderr, stderr);
  assert.strictEqual(output.merged, merged);
}

function checkError(err: unknown, message: string, stdout: string, stderr: string, merged: string) {
  assert.ok(err instanceof SpawnError);
  assert.strictEqual(err.message, message);
  checkOutput(err.output, stdout, stderr, merged);
}

function spawnLive(opts: SpawnOptions, error?: boolean) {
  return spawn('node', ['tests/cmd/live.js', error ? 'panic' : '1  2', '🌏'], opts);
}

const liveStdoutOut = "log 🏃‍♀️🏃‍♂️🏃\nlog 🏃‍♀️🏃‍♂️🏃\nlog 🏃‍♀️🏃‍♂️🏃\n[ '1  2', '🌏' ]";
const liveErrStdoutOut = "log 🏃‍♀️🏃‍♂️🏃\nlog 🏃‍♀️🏃‍♂️🏃\nlog 🏃‍♀️🏃‍♂️🏃\n[ 'panic', '🌏' ]";
const liveStderrOut = 'error 🏃‍♀️🏃‍♂️🏃\nerror 🏃‍♀️🏃‍♂️🏃\nerror 🏃‍♀️🏃‍♂️🏃';
const liveMergedOut =
  "log 🏃‍♀️🏃‍♂️🏃\nerror 🏃‍♀️🏃‍♂️🏃\nlog 🏃‍♀️🏃‍♂️🏃\nerror 🏃‍♀️🏃‍♂️🏃\nlog 🏃‍♀️🏃‍♂️🏃\nerror 🏃‍♀️🏃‍♂️🏃\n[ '1  2', '🌏' ]";
const liveErrMergedOut =
  "log 🏃‍♀️🏃‍♂️🏃\nerror 🏃‍♀️🏃‍♂️🏃\nlog 🏃‍♀️🏃‍♂️🏃\nerror 🏃‍♀️🏃‍♂️🏃\nlog 🏃‍♀️🏃‍♂️🏃\nerror 🏃‍♀️🏃‍♂️🏃\n[ 'panic', '🌏' ]";

it('Success', async () => {
  const output = await spawn('echo', ['a', 'b bb']);
  checkOutput(output, 'a b bb', '', '');
});

it('Error', async () => {
  try {
    await spawn('grep', ['find', '_no_such_file_']);
    assert.ok(0);
  } catch (err) {
    checkError(
      err,
      'Process exited with code 2',
      '',
      'grep: _no_such_file_: No such file or directory',
      '',
    );
  }
});

it('Live', async () => {
  const out: Buffer[] = [];
  const err: Buffer[] = [];
  const output = await spawnLive({
    liveOutput: (chunk, type) => {
      if (type === 'stdout') {
        out.push(chunk);
      } else if (type === 'stderr') {
        err.push(chunk);
      }
    },
  });
  checkOutput(output, liveStdoutOut, liveStderrOut, '');
  assert.strictEqual(Buffer.concat(out).toString(), liveStdoutOut + '\n');
  assert.strictEqual(Buffer.concat(err).toString(), liveStderrOut + '\n');
});

it('Merged output', async () => {
  const output = await spawnLive({ mergedOutput: true });
  checkOutput(output, liveStdoutOut, liveStderrOut, liveMergedOut);
});

it('Merged output (error)', async () => {
  try {
    await await spawnLive({ mergedOutput: true }, true);
    assert.ok(0);
  } catch (err) {
    checkError(
      err,
      'Process exited with code 100',
      liveErrStdoutOut,
      liveStderrOut,
      liveErrMergedOut,
    );
  }
});
