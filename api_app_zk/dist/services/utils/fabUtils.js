'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _constants = require('../../config/constants');

var _constants2 = _interopRequireDefault(_constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');

const fabUtils = {};

const connect = (() => {
  var _ref = _asyncToGenerator(function* (methodName, args, wallet, isInvoke) {
    const identity = yield wallet.get(_constants2.default.FAB.IDENTITY);
    if (!identity) {
      throw Error('An identity for the user does not exist in the wallet');
    }
    const gateway = new Gateway();
    const ccp = JSON.parse(fs.readFileSync(_constants2.default.FAB.CCP, 'utf8'));

    yield gateway.connect(ccp, {
      wallet,
      identity: _constants2.default.FAB.IDENTITY,
      discovery: { enabled: true, asLocalhost: true }
    });
    const network = yield gateway.getNetwork(_constants2.default.FAB.CHANNEL);
    const contract = network.getContract(_constants2.default.FAB.CHAINCODE);
    let tx;
    if (isInvoke) {
      tx = yield contract.submitTransaction(methodName, ...args);
    } else {
      tx = yield contract.evaluateTransaction(methodName, ...args);
    }
    yield gateway.disconnect();
    return tx;
  });

  return function connect(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
})();

fabUtils.initWallet = _asyncToGenerator(function* () {
  const wallet = yield Wallets.newInMemoryWallet();
  const cert = fs.readFileSync(_constants2.default.FAB.CERT).toString();
  const key = fs.readFileSync(_constants2.default.FAB.KEY).toString();

  const identity = {
    credentials: {
      certificate: cert,
      privateKey: key
    },
    mspId: 'Org1MSP',
    type: 'X.509'
  };

  yield wallet.put(_constants2.default.FAB.IDENTITY, identity);
  return wallet;
});

fabUtils.query = (() => {
  var _ref3 = _asyncToGenerator(function* (methodName, args, wallet) {
    return connect(methodName, args, wallet, false);
  });

  return function (_x5, _x6, _x7) {
    return _ref3.apply(this, arguments);
  };
})();
fabUtils.invoke = (() => {
  var _ref4 = _asyncToGenerator(function* (methodName, args, wallet) {
    return connect(methodName, args, wallet, true);
  });

  return function (_x8, _x9, _x10) {
    return _ref4.apply(this, arguments);
  };
})();

exports.default = fabUtils;