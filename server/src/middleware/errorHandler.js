import { failure } from '../utils/apiResponse.js';

export function notFoundHandler(req, res) {
  return failure(res, { message: `Route not found: ${req.method} ${req.originalUrl}`, statusCode: 404 });
}

export function errorHandler(err, req, res, next) {
  console.error('[error]', err);

  if (err.name === 'ValidationError') {
    const errors = {};
    for (const key in err.errors) {
      errors[key] = err.errors[key].message;
    }
    return failure(res, { message: 'Validation failed', statusCode: 422, errors });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {}).pop() || 'field';
    return failure(res, {
      message: `Duplicate value for ${field}. It must be unique within your company.`,
      statusCode: 409,
    });
  }

  if (err.name === 'CastError') {
    return failure(res, { message: 'Invalid identifier supplied', statusCode: 400 });
  }

  const statusCode = err.statusCode || 500;
  return failure(res, {
    message: err.message || 'Internal server error',
    statusCode,
    errors: err.errors || null,
  });
}
