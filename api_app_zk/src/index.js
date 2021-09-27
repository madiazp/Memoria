import Proof from './services/proof';

const Koa = require('koa');
const KoaRouter = require('koa-router');
const koaBody = require('koa-body');
const json = require('koa-json');
const cors = require('@koa/cors');

const app = new Koa();
app.use(cors());
const router = new KoaRouter();

// const Sentry = require('@sentry/node');

const proof = Proof();

// if (env.api.env === 'prod') {
//   Sentry.init({ dsn: env.api.sentry });
// }

app.use(json());

router.get('/pin', koaBody(), ctx => {
  ctx.body = 'pong';
});

router.post('/genproof', koaBody(), async ctx => {
  ctx.body = await proof.genproof(ctx);
});

router.get('/checkproof/:key', koaBody(), async ctx => {
  ctx.body = await proof.checkproof(ctx);
});

router.post('/init', koaBody(), async ctx => {
  ctx.body = await proof.initializeSystem(ctx);
});
router.post('/addId', koaBody(), async ctx => {
  ctx.body = await proof.addVoteId(ctx);
});
router.post('/vote', koaBody(), async ctx => {
  ctx.body = await proof.vote(ctx);
});
router.get('/artifacts', koaBody(), async ctx => {
  ctx.body = await proof.getArtifacts(ctx);
});
router.get('/results', koaBody(), async ctx => {
  ctx.body = await proof.getResult(ctx);
});
app
  .use(router.routes())
  .use(router.allowedMethods());

const server = app.listen('5004');
console.log(`Server running on port ${server.address().port} ...`);
