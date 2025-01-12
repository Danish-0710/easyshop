import winston from 'winston';
import { config } from '../config';

const { combine, timestamp, json, colorize, simple, printf } = winston.format;

const customFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] : ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

const developmentFormat = combine(
  colorize(),
  timestamp(),
  customFormat
);

const productionFormat = combine(
  timestamp(),
  json()
);

export const logger = winston.createLogger({
  level: config.logging.level || 'info',
  format: config.env === 'production' ? productionFormat : developmentFormat,
  transports: [
    new winston.transports.Console({
      format: config.env === 'production' ? productionFormat : developmentFormat,
    }),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      format: productionFormat,
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      format: productionFormat,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ],
});
