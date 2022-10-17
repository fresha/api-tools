import * as winston from 'winston';

export type Logger = winston.Logger;

export const createLogger = (verbose: boolean): Logger => {
  return winston.createLogger({
    level: verbose ? 'info' : 'warn',
    transports: [new winston.transports.Console({ format: winston.format.simple() })],
  });
};
