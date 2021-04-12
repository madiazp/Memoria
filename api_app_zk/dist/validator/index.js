'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fastestValidator = require('fastest-validator');

var _fastestValidator2 = _interopRequireDefault(_fastestValidator);

var _errors = require('../errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = (() => {
  var _ref = _asyncToGenerator(function* (schema, params, fn) {
    const validator = new _fastestValidator2.default();

    const check = validator.compile(schema);
    const validationResult = check(params);

    if (validationResult === true) {
      if (fn) {
        return fn(params);
      } else {
        return true;
      }
    } else {
      return new _errors.ValidationError(validationResult.map(function (vr) {
        return vr.message;
      }), 400);
    }
  });

  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();