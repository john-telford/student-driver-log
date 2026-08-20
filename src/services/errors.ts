// Typed errors thrown by the service layer. Callers (Server Actions, REST
// handlers) translate these to their own transport — HTTP status codes for the
// API, action state for the web. Keeping the taxonomy here means the mapping
// lives in one place per surface, not scattered through business logic.

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ValidationError extends Error {
  fields?: Record<string, string>;
  constructor(message = 'Validation failed', fields?: Record<string, string>) {
    super(message);
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}
