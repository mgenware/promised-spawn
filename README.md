# promised-spawn

spawn + Promise + live data chunks + merged output of stdout and stderr.

## Installation

```sh
npm i promised-spawn
```

## Usage

Simple echo command:

```ts
import spawn from 'promised-spawn';

const output = await spawn('echo', ['a', 'b bb']);
/*
 output.stdout: 'a b bb'
*/
```

Merged output of stdio and stderr:

```ts
import spawn from 'promised-spawn';

const output = await spawn('<a long task>', [], { mergedOutput: true });
/*
 output.stdout:
 log1
 log2
 log3

 output.stderr:
 err1
 err2

 output.merged:
 log1
 err1
 log2
 err3
 log3
*/
```

Capture live data chunks:

```ts
import spawn from 'promised-spawn';

const out: Buffer[] = [];
const err: Buffer[] = [];
await spawn('<a long task>', [], {
  liveOutput: (chunk, type) => {
    if (type === 'stdout') {
      out.push(chunk);
    } else if (type === 'stderr') {
      err.push(chunk);
    }
  },
});

console.log(Buffer.concat(out).toString());
console.log(Buffer.concat(err).toString());

/*
 out:
 log1
 log2
 log3

 err:
 err1
 err2
*/
```

Handle errors:

```ts
import spawn, { SpawnError } from 'promised-spawn';

try {
  const output = await spawn('<a long task>', [], { mergedOutput: true });
} catch (err) {
  if (err instanceof SpawnError) {
    console.log(err.output);
    console.log(err.message);
  }
}
/*
 err.output.stdout:
 log1
 log2
 log3

 err.output.stderr:
 err1
 err2

 err.output.merged:
 log1
 err1
 log2
 err3
 log3

 err.message:
 Processed exited with code 1.
*/
```

## API

```ts
export interface SpawnOptions {
  // Options passed to node spawn.
  spawnOptions?: SpawnOptionsWithoutStdio;
  // Used to capture live IO chunks.
  liveOutput?: (chunk: Buffer, source: 'stdout' | 'stderr') => void;
  // Whether merging stdio and stderr is enabled.
  // Once enabled, use `SpawnOutput.merge` to get merged output.
  mergedOutput?: boolean;
}

// Output of a spawn operation.
// If the spawn succeeded, it's returned as the result of promise.
// Otherwise, you can grab the output via `SpawnError.output`.
export interface SpawnOutput {
  // Output of stdout.
  stdout: string;
  // Output of stderr.
  stderr: string;
  // Merged output of stdio and stderr.
  // Only applicable when `SpawnOptions.mergedOutput` is true.
  merged: string;
}

// The error type when spawn promise is rejected.
export class SpawnError extends Error;

export default function spawnAsync(command: string, args?: string[], opts?: SpawnOptions);
```
