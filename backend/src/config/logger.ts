import winston from 'winston';
import 'winston-mongodb';
import path from 'path';

const { combine, timestamp, json, errors, printf, colorize } = winston.format;

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  if (stack) {
    msg += `\n${stack}`;
  }
  return msg;
});

// Create transports array
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      consoleFormat
    ),
  }),
];

// Add MongoDB transport if MongoDB URI is available
const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
  try {
    const mongoTransport = new winston.transports.MongoDB({
      db: mongoUri,
      collection: 'logs',
      format: combine(timestamp(), json()),
      options: {
        useUnifiedTopology: true,
      },
      metaKey: 'metadata',
      level: 'info',
    });
    transports.push(mongoTransport);
  } catch (error) {
    console.error('Failed to initialize MongoDB logging transport:', error);
  }
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: {
    service: 'msme-lending-backend',
    environment: process.env.NODE_ENV || 'development',
  },
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  transports,
  exitOnError: false,
});

// Add file transports for production
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      format: combine(timestamp(), json()),
    })
  );
  logger.add(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      format: combine(timestamp(), json()),
    })
  );
}

// Handle uncaught exceptions
logger.exceptions.handle(
  new winston.transports.Console({
    format: combine(colorize(), timestamp(), consoleFormat),
  })
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { reason });
});

export default logger;
