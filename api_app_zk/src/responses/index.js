export default class Response {
  constructor(message, code, payload) {
    this.code = code;
    this.message = message;
    this.payload = payload;
  }
}
