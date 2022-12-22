import { Console } from 'console';
import { Writable } from 'stream';

import * as winston from 'winston';

export type Logger = winston.Logger;

export const createLogger = (verbose: boolean): Logger => {
  return winston.createLogger({
    level: verbose ? 'info' : 'warn',
    transports: [new winston.transports.Console({ format: winston.format.simple() })],
  });
};

class NullWritable extends Writable {
  // eslint-disable-next-line class-methods-use-this, no-underscore-dangle
  _write(_chunk: unknown, _encoding: string, callback: (error?: Error | null) => void): void {
    callback();
  }

  // eslint-disable-next-line class-methods-use-this, no-underscore-dangle
  _writev(
    _chunks: Array<{ chunk: unknown; encoding: string }>,
    callback: (error?: Error | null) => void,
  ): void {
    callback();
  }
}

export const createConsole = (verbose: boolean): Console => {
  if (verbose) {
    return new Console(process.stdout, process.stderr);
  }
  const devNull = new NullWritable();
  return new Console(devNull, devNull);
};
