import type { ErrorRequestHandler } from 'express';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const errors = {
  validation: (message: string, details?: unknown) =>
    new HttpError(400, 'VALIDATION', message, details),
  unauthorized: (message = 'Unauthorized') =>
    new HttpError(401, 'UNAUTHORIZED', message),
  invalidCredentials: () =>
    new HttpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password'),
  forbidden: (message = 'Forbidden') =>
    new HttpError(403, 'FORBIDDEN', message),
  notFound: (message = 'Not found') =>
    new HttpError(404, 'NOT_FOUND', message),
  emailExists: () =>
    new HttpError(409, 'EMAIL_EXISTS', 'Email already registered'),
  invalidStatus: (message: string) =>
    new HttpError(409, 'INVALID_STATUS', message),
  internal: (message = 'Internal server error') =>
    new HttpError(500, 'INTERNAL', message),
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
    return;
  }
  console.error('[error] unexpected:', err);
  res.status(500).json({
    error: { code: 'INTERNAL', message: 'Internal server error' },
  });
};
