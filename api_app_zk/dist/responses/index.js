"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
class Response {
  constructor(message, code, payload) {
    this.code = code;
    this.message = message;
    this.payload = payload;
  }
}
exports.default = Response;