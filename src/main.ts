import { spawn, SpawnOptionsWithoutStdio } from 'child_process';

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
export class SpawnError extends Error {
  constructor(public output: SpawnOutput, err: unknown) {
    super(err instanceof Error ? err.message : `${err}`);
  }
}

export default function spawnAsync(command: string, args?: string[], opts?: SpawnOptions) {
  return new Promise<SpawnOutput>((resolve, reject) => {
    const pro = spawn(command, args, opts?.spawnOptions);
    const outBuf: Buffer[] = [];
    const errBuf: Buffer[] = [];
    const allBuf: Buffer[] = [];

    const getOutput = () =>
      ({
        stdout: Buffer.concat(outBuf).toString().trimEnd(),
        stderr: Buffer.concat(errBuf).toString().trimEnd(),
        merged: Buffer.concat(allBuf).toString().trimEnd(),
      } as SpawnOutput);

    const panic = (err: unknown) => {
      reject(new SpawnError(getOutput(), err));
    };

    pro.stdout.on('data', (data: Buffer) => {
      outBuf.push(data);
      opts?.liveOutput?.(data, 'stdout');
      if (opts?.mergedOutput) {
        allBuf.push(data);
      }
    });
    pro.stdout.on('error', panic);
    pro.stderr.on('data', (data: Buffer) => {
      errBuf.push(data);
      opts?.liveOutput?.(data, 'stderr');
      if (opts?.mergedOutput) {
        allBuf.push(data);
      }
    });
    pro.stderr.on('error', panic);

    pro.on('close', (code) => {
      if (code === 0) {
        resolve(getOutput());
      } else {
        panic(new Error(`Process exited with code ${code}`));
      }
    });
  });
}
