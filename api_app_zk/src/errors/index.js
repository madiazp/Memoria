export class ValidationError extends Error {
  constructor(message, code) {
    super(message || 'validation error');
    this.code = code;
  }
}
export class NotAuthorizedError extends Error {
  constructor(message, code) {
    super(message || 'not authorized');
    this.code = code;
  }
}
export class NotAuthenticatedError extends Error {
  constructor(message, code) {
    super(message || 'not authenticated');
    this.code = code;
  }
}
export class NotFoundError extends Error {
  constructor(message, code) {
    super(message || 'not found');
    this.code = code;
  }
}
export class InternalServerError extends Error {
  constructor(message, code) {
    super(message || 'Ooops, something went wrong!');
    this.code = code;
  }
}
export class OrderingError extends Error {
  constructor(message) {
    super(message || 'Failed to order the transaction');
    this.code = 1350;
  }
}
export class QueryError extends Error {
  constructor(message, payload) {
    super(message || 'Failed to query');
    this.code = 1450;
    this.payload = payload;
  }
}
