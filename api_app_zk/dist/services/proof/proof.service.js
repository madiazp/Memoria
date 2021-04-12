'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _node = require('zokrates-js/node');

var _apicc = require('../utils/apicc');

var _apicc2 = _interopRequireDefault(_apicc);

var _artifacts = require('../utils/artifacts');

var _artifacts2 = _interopRequireDefault(_artifacts);

var _responses = require('../../responses');

var _responses2 = _interopRequireDefault(_responses);

var _codes = require('../../config/codes');

var _codes2 = _interopRequireDefault(_codes);

var _constants = require('../../config/constants');

var _constants2 = _interopRequireDefault(_constants);

var _fabUtils = require('../utils/fabUtils');

var _fabUtils2 = _interopRequireDefault(_fabUtils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let state = {
  artifacts: {},
  pk: {},
  voteRoll: [],
  voteConst: {},
  isInit: false,
  wallet: null
};

exports.default = () => {
  const proof = {};

  proof.initializeSystem = (() => {
    var _ref = _asyncToGenerator(function* (ctx, params) {
      try {
        if (state.isInit) throw Error('Proccess already initialized');
        const zok = yield (0, _node.initialize)();
        const artifacts = zok.compile(_codes2.default.VOTE);
        const keyPair = zok.setup(artifacts.program);
        const padron = {
          voters: _constants2.default.VOTEROLL.slice(0, parseInt(params.numberVoters, 10)),
          vote_const: params.voteConstant,
          verification_key: JSON.stringify(keyPair.vk)
        };
        console.log(Object.keys(padron));
        state = yield _apicc2.default.setup(padron, state);
        state.artifacts = artifacts;
        state.pk = keyPair.pk;
        state.isInit = true;
        return new _responses2.default(_constants2.default.SUCCESS.PUSH.MSG, _constants2.default.SUCCESS.PUSH.CODE, state);
      } catch (e) {
        console.log(e);
        return new _responses2.default(_constants2.default.ERRORS.PUSH.MSG, _constants2.default.ERRORS.PUSH.CODE, e);
      }
    });

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  })();

  proof.getArtifacts = (() => {
    var _ref2 = _asyncToGenerator(function* (params) {
      try {
        if (!state.wallet) state.wallet = yield _fabUtils2.default.initWallet();
        const res = yield _apicc2.default.getArtifacts(state.wallet);
        const objRes = JSON.parse(res.toString());
        objRes.artifacts = state.artifacts;
        objRes.pk = state.pk;
        return new _responses2.default(_constants2.default.SUCCESS.PUSH.MSG, _constants2.default.SUCCESS.PUSH.CODE, objRes);
      } catch (e) {
        return new _responses2.default(_constants2.default.ERRORS.PUSH.MSG, _constants2.default.ERRORS.PUSH.CODE, e);
      }
    });

    return function (_x3) {
      return _ref2.apply(this, arguments);
    };
  })();

  proof.addVoteId = (() => {
    var _ref3 = _asyncToGenerator(function* (ctx) {
      try {
        const params = ctx.request.body;
        if (!state.wallet) state.wallet = yield _fabUtils2.default.initWallet();
        const res = yield _apicc2.default.addId(params.id, state.wallet);
        return new _responses2.default(_constants2.default.SUCCESS.CHECK.MSG, _constants2.default.SUCCESS.CHECK.CODE, 'ok');
      } catch (e) {
        console.log(e);
        return new _responses2.default(_constants2.default.ERRORS.CHECK.MSG, _constants2.default.ERRORS.CHECK.CODE, e);
      }
    });

    return function (_x4) {
      return _ref3.apply(this, arguments);
    };
  })();
  proof.vote = (() => {
    var _ref4 = _asyncToGenerator(function* (ctx) {
      try {
        const params = ctx.request.body;
        if (!state.wallet) state.wallet = yield _fabUtils2.default.initWallet();
        const res = yield _apicc2.default.vote(params.proof, params.value, state.wallet);
        return new _responses2.default(_constants2.default.SUCCESS.CHECK.MSG, _constants2.default.SUCCESS.CHECK.CODE, res);
      } catch (e) {
        console.log(e);
        return new _responses2.default(_constants2.default.ERRORS.CHECK.MSG, _constants2.default.ERRORS.CHECK.CODE, e);
      }
    });

    return function (_x5) {
      return _ref4.apply(this, arguments);
    };
  })();
  proof.getResult = (() => {
    var _ref5 = _asyncToGenerator(function* (params) {
      try {
        if (!state.wallet) state.wallet = yield _fabUtils2.default.initWallet();
        const res = yield _apicc2.default.getResult(state.wallet);
        const objRes = JSON.parse(res.toString());
        return new _responses2.default(_constants2.default.SUCCESS.PUSH.MSG, _constants2.default.SUCCESS.PUSH.CODE, objRes);
      } catch (e) {
        return new _responses2.default(_constants2.default.ERRORS.PUSH.MSG, _constants2.default.ERRORS.PUSH.CODE, e);
      }
    });

    return function (_x6) {
      return _ref5.apply(this, arguments);
    };
  })();
  return proof;
};