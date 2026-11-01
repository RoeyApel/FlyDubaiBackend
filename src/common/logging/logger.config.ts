import type { Params } from 'nestjs-pino';
import type { LogLevel } from '../../config/env.validation.js';

/** Probe endpoints, left out of request logs to keep them readable. */
const QUIET_ROUTE_SUFFIXES = ['/health'];

export function createLoggerParams(level: LogLevel): Params {
  return {
    pinoHttp: {
      level,
      redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie'],
        censor: '[Redacted]',
      },
      autoLogging: {
        ignore: (req) =>
          QUIET_ROUTE_SUFFIXES.some((suffix) => req.url?.endsWith(suffix)),
      },
      customSuccessMessage: (req, res, responseTime) =>
        `${req.method} ${req.url} -> ${res.statusCode} (${responseTime}ms)`,
      customErrorMessage: (req, res, error) =>
        `${req.method} ${req.url} -> ${res.statusCode}: ${error.message}`,
      formatters: {
        level: (label) => ({ level: label }),
      },
    },
  };
}
