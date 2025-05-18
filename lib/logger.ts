import pino, { ChildLoggerOptions, Logger } from 'pino';

const isProduction = process.env['NODE_ENV'] === 'production';
const isClient = typeof window !== 'undefined';

// Pino options for the server environment
const pinoOptions = {
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: !isProduction,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
      singleLine: true,
      messageFormat: '{msg}',
    },
  },
};

// Logger configuration: lower log levels or suppress logs in the browser
const baseLogger: Logger = isClient
  ? pino({ level: 'silent' }) // No logs in the client-side environment
  : isProduction
    ? pino({ ...pinoOptions, level: 'info' }) // Production logs on the server
    : pino({ ...pinoOptions, level: 'debug' }); // Debug logs on the server in development

// Message formatting for logs
const formatMessage = (args: unknown[]): string => {
  return args
    .map((arg) => {
      if (arg instanceof Error) return arg.message;

      return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
    })
    .join(' ');
};

// Wrap logger to use custom message formatting
const wrapLogger = (logger: Logger) => ({
  ...logger,
  debug: (...args: unknown[]) => logger.debug(formatMessage(args)),
  error: (...args: unknown[]) => logger.error(formatMessage(args)),
  info: (...args: unknown[]) => logger.info(formatMessage(args)),
  warn: (...args: unknown[]) => logger.warn(formatMessage(args)),
  child: (bindings: Record<string, unknown>, options?: ChildLoggerOptions) => {
    const childLogger = logger.child(
      bindings as Record<string, unknown>,
      options as ChildLoggerOptions,
    );
    return wrapLogger(childLogger);
  },
});

export const logger = wrapLogger(baseLogger);
