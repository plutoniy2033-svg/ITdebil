import { config } from '../config.js';

export function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode ?? 500;
  const message =
    statusCode >= 500 && config.isProduction ? 'Internal server error' : error.message;

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({ error: message });
}

export function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
