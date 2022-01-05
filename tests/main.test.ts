/* eslint-disable prefer-template */
import * as assert from 'assert';
import spawn, { SpawnOutput, SpawnError, SpawnOptions } from '../dist/main.js';

const windows = process.platform === 'win32';

function sortLines(str: string): string[] {
  return str.split(/\r?\n/).sort((a, b) => a.localeCompare(b));
}

function checkInterleavedOutput(a: string, b: string) {
  assert.deepStrictEqual(sortLines(a), sortLines(b));
}

function checkOutput(output: SpawnOutput, stdout: string, stderr: string, merged: string) {
  assert.strictEqual(output.stdout, stdout);
  assert.strictEqual(output.stderr, stderr);
  checkInterleavedOutput(output.merged, merged);
}

function checkError(err: unknown, message: string, stdout: string, stderr: string, merged: string) {
  assert.ok(err instanceof SpawnError);
  assert.strictEqual(err.message, message);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  checkOutput(err.output, stdout, stderr, merged);
}

function spawnLive(opts: SpawnOptions, error?: boolean) {
  return spawn('node', ['tests/cmd/live.js', error ? 'panic' : '1  2', '🌏'], opts);
}

// Used in windows tests as `echo` is not callable in windows.
function matchNodeVer(s: string) {
  assert.match(s, /v\d+\.\d+.\d+/);
}

const liveStdoutOut = "log 🏃‍♀️🏃‍♂️🏃\nlog 🏃‍♀️🏃‍♂️🏃\nlog 🏃‍♀️🏃‍♂️🏃\n[ '1  2', '🌏' ]";
const liveErrStdoutOut = "log 🏃‍♀️🏃‍♂️🏃\nlog 🏃‍♀️🏃‍♂️🏃\nlog 🏃‍♀️🏃‍♂️🏃\n[ 'panic', '🌏' ]";
const liveStderrOut = 'error 🏃‍♀️🏃‍♂️🏃\nerror 🏃‍♀️🏃‍♂️🏃\nerror 🏃‍♀️🏃‍♂️🏃';
const liveMergedOut =
  "log 🏃‍♀️🏃‍♂️🏃\nerror 🏃‍♀️🏃‍♂️🏃\nlog 🏃‍♀️🏃‍♂️🏃\nerror 🏃‍♀️🏃‍♂️🏃\nlog 🏃‍♀️🏃‍♂️🏃\nerror 🏃‍♀️🏃‍♂️🏃\n[ '1  2', '🌏' ]";
const liveErrMergedOut =
  "log 🏃‍♀️🏃‍♂️🏃\nerror 🏃‍♀️🏃‍♂️🏃\nlog 🏃‍♀️🏃‍♂️🏃\nerror 🏃‍♀️🏃‍♂️🏃\nlog 🏃‍♀️🏃‍♂️🏃\nerror 🏃‍♀️🏃‍♂️🏃\n[ 'panic', '🌏' ]";

it('Success', async () => {
  if (windows) {
    const output = await spawn('node', ['-v']);
    matchNodeVer(output.stdout);
    assert.strictEqual(output.stderr, '');
    assert.strictEqual(output.merged, '');
  } else {
    const output = await spawn('echo', ['a', 'b bb']);
    checkOutput(output, 'a b bb', '', '');
  }
});

if (!windows) {
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
}

it('Live', async () => {
  const out: Buffer[] = [];
  const err: Buffer[] = [];
  const output = await spawnLive({
    liveOutput: (chunk: Buffer, type) => {
      switch (type) {
        case 'stdout': {
          out.push(chunk);
          break;
        }
        case 'stderr': {
          err.push(chunk);
          break;
        }
        default:
          throw new Error(`Unknown type ${type}`);
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
    await spawnLive({ mergedOutput: true }, true);
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
