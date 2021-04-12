'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
class ValidationError extends Error {
  constructor(message, code) {
    super(message || 'validation error');
    this.code = code;
  }
}
exports.ValidationError = ValidationError;
class NotAuthorizedError extends Error {
  constructor(message, code) {
    super(message || 'not authorized');
    this.code = code;
  }
}
exports.NotAuthorizedError = NotAuthorizedError;
class NotAuthenticatedError extends Error {
  constructor(message, code) {
    super(message || 'not authenticated');
    this.code = code;
  }
}
exports.NotAuthenticatedError = NotAuthenticatedError;
class NotFoundError extends Error {
  constructor(message, code) {
    super(message || 'not found');
    this.code = code;
  }
}
exports.NotFoundError = NotFoundError;
class InternalServerError extends Error {
  constructor(message, code) {
    super(message || 'Ooops, something went wrong!');
    this.code = code;
  }
}
exports.InternalServerError = InternalServerError;
class OrderingError extends Error {
  constructor(message) {
    super(message || 'Failed to order the transaction');
    this.code = 1350;
  }
}
exports.OrderingError = OrderingError;
class QueryError extends Error {
  constructor(message, payload) {
    super(message || 'Failed to query');
    this.code = 1450;
    this.payload = payload;
  }
}
exports.QueryError = QueryError;