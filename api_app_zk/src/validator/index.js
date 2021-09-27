import Validator from 'fastest-validator';
import { ValidationError } from '../errors';

export default async (schema, params, fn) => {
  const validator = new Validator();

  const check = validator.compile(schema);
  const validationResult = check(params);

  if (validationResult === true) {
    if (fn) {
      return fn(params);
    } else {
      return true;
    }
  } else {
    return new ValidationError(validationResult.map(vr => vr.message), 400);
  }
};
