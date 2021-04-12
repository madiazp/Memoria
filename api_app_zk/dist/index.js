'use strict';

var _proof = require('./services/proof');

var _proof2 = _interopRequireDefault(_proof);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const Koa = require('koa');
const KoaRouter = require('koa-router');
const koaBody = require('koa-body');
const json = require('koa-json');
const cors = require('@koa/cors');

const app = new Koa();
app.use(cors());
const router = new KoaRouter();

// const Sentry = require('@sentry/node');

const proof = (0, _proof2.default)();

// if (env.api.env === 'prod') {
//   Sentry.init({ dsn: env.api.sentry });
// }

app.use(json());

router.get('/pin', koaBody(), ctx => {
  ctx.body = 'pong';
});

router.post('/genproof', koaBody(), (() => {
  var _ref = _asyncToGenerator(function* (ctx) {
    ctx.body = yield proof.genproof(ctx);
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})());

router.get('/checkproof/:key', koaBody(), (() => {
  var _ref2 = _asyncToGenerator(function* (ctx) {
    ctx.body = yield proof.checkproof(ctx);
  });

  return function (_x2) {
    return _ref2.apply(this, arguments);
  };
})());

router.post('/init', koaBody(), (() => {
  var _ref3 = _asyncToGenerator(function* (ctx) {
    ctx.body = yield proof.initializeSystem(ctx);
  });

  return function (_x3) {
    return _ref3.apply(this, arguments);
  };
})());
router.post('/addId', koaBody(), (() => {
  var _ref4 = _asyncToGenerator(function* (ctx) {
    ctx.body = yield proof.addVoteId(ctx);
  });

  return function (_x4) {
    return _ref4.apply(this, arguments);
  };
})());
router.post('/vote', koaBody(), (() => {
  var _ref5 = _asyncToGenerator(function* (ctx) {
    ctx.body = yield proof.vote(ctx);
  });

  return function (_x5) {
    return _ref5.apply(this, arguments);
  };
})());
router.get('/artifacts', koaBody(), (() => {
  var _ref6 = _asyncToGenerator(function* (ctx) {
    ctx.body = yield proof.getArtifacts(ctx);
  });

  return function (_x6) {
    return _ref6.apply(this, arguments);
  };
})());
router.get('/results', koaBody(), (() => {
  var _ref7 = _asyncToGenerator(function* (ctx) {
    ctx.body = yield proof.getResult(ctx);
  });

  return function (_x7) {
    return _ref7.apply(this, arguments);
  };
})());
app.use(router.routes()).use(router.allowedMethods());

const server = app.listen('5004');
console.log(`Server running on port ${server.address().port} ...`);