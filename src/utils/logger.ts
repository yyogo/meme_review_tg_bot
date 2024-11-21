import { createLogger, transports, format } from 'winston';
import { config } from '../config/config';

const logger = createLogger({
    level: config.logLevel,
    format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'combined.log', level: 'debug' }),
    ]
});

export default logger;
