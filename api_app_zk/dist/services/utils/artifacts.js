'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _constants = require('../../config/constants');

var _constants2 = _interopRequireDefault(_constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const fs = require('fs').promises;
const path = require('path');

const readFile = (() => {
  var _ref = _asyncToGenerator(function* (filename) {
    const filepath = path.resolve(__dirname, `../../${filename}`);
    const resp = yield fs.readFile(filepath, 'utf8');
    return resp;
  });

  return function readFile(_x) {
    return _ref.apply(this, arguments);
  };
})();

const getOut = (() => {
  var _ref2 = _asyncToGenerator(function* () {
    const resp = yield readFile(_constants2.default.FILES.OUT);
    return resp;
  });

  return function getOut() {
    return _ref2.apply(this, arguments);
  };
})();

const getProverKey = (() => {
  var _ref3 = _asyncToGenerator(function* () {
    return readFile(_constants2.default.FILES.PROVER);
  });

  return function getProverKey() {
    return _ref3.apply(this, arguments);
  };
})();

exports.default = {
  getOut,
  getProverKey

};