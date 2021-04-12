'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _environment = require('../../config/environment');

var _environment2 = _interopRequireDefault(_environment);

var _fabUtils = require('./fabUtils');

var _fabUtils2 = _interopRequireDefault(_fabUtils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const axios = require('axios');

const env = (0, _environment2.default)();
const apicc = {};

apicc.setup = (() => {
  var _ref = _asyncToGenerator(function* (padron, state) {
    state.wallet = yield _fabUtils2.default.initWallet();
    const padronj = [JSON.stringify(padron)];
    yield _fabUtils2.default.invoke('CcSetup', padronj, state.wallet);
    state.isInit = true;
    return state;
  });

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

apicc.vote = (() => {
  var _ref2 = _asyncToGenerator(function* (proof, value, wallet) {
    const args = [proof, value];
    const res = yield _fabUtils2.default.invoke('CcVote', args, wallet);
    return res;
  });

  return function (_x3, _x4, _x5) {
    return _ref2.apply(this, arguments);
  };
})();

apicc.addId = (() => {
  var _ref3 = _asyncToGenerator(function* (id, wallet) {
    const args = [id];
    const res = yield _fabUtils2.default.invoke('CcAddId', args, wallet);
    return res;
  });

  return function (_x6, _x7) {
    return _ref3.apply(this, arguments);
  };
})();

apicc.getArtifacts = (() => {
  var _ref4 = _asyncToGenerator(function* (wallet) {
    const res = yield _fabUtils2.default.query('CcGetArtifacts', [], wallet);
    return res;
  });

  return function (_x8) {
    return _ref4.apply(this, arguments);
  };
})();

apicc.getResult = (() => {
  var _ref5 = _asyncToGenerator(function* (wallet) {
    const res = yield _fabUtils2.default.query('CcGetResult', [], wallet);
    return res;
  });

  return function (_x9) {
    return _ref5.apply(this, arguments);
  };
})();

apicc.getAll = (() => {
  var _ref6 = _asyncToGenerator(function* (proofjson) {
    axios.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';
    const proof = yield axios.post(`${env.api.network.apichainzk.endpoints.url}/proof`, proofjson);
    return proof.data;
  });

  return function (_x10) {
    return _ref6.apply(this, arguments);
  };
})();

exports.default = apicc;