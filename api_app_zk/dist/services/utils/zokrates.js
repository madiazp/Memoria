'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _constants = require('../../config/constants');

var _constants2 = _interopRequireDefault(_constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const { spawnSync } = require('child_process');
const path = require('path');

const pyscript = _constants2.default.SCRIPT.KEY;
const script = _constants2.default.SCRIPT.PROOF;

const rawWitness = (() => {
  var _ref = _asyncToGenerator(function* (rut, mt) {
    const filepath = path.resolve(__dirname, `../../${pyscript}`);
    const witnessRaw = spawnSync('python3', [filepath, 'witness', rut, mt], { cwd: path.resolve(__dirname, '../../') });
    return witnessRaw.stdout.toString();
  });

  return function rawWitness(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

const scriptProof = (() => {
  var _ref2 = _asyncToGenerator(function* (filepath, witness) {
    const proof = yield spawnSync(filepath, [witness.toString()], { cwd: path.resolve(__dirname, '../../') });
    return proof.stdout.toString();
  });

  return function scriptProof(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

const genProof = (() => {
  var _ref3 = _asyncToGenerator(function* (rut, mt) {
    const filepath = path.resolve(__dirname, `../../${script}`);
    const witness = yield rawWitness(rut, mt);
    const resp = yield scriptProof(filepath, witness);
    return resp;
  });

  return function genProof(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
})();

exports.default = {
  rawWitness,
  genProof
};