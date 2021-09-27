import { initialize } from 'zokrates-js/node';
import apicc from '../utils/apicc';
import art from '../utils/artifacts';
import Response from '../../responses';
import codes from '../../config/codes';
import cons from '../../config/constants';
import fabUtils from '../utils/fabUtils';

let state = {
  artifacts: {},
  pk: {},
  voteRoll: [],
  voteConst: {},
  isInit: false,
  wallet: null,
};

export default () => {
  const proof = {};

  proof.initializeSystem = async (ctx, params) => {
    try {
      if (state.isInit) throw Error('Proccess already initialized');
      const zok = await initialize();
      const artifacts = zok.compile(codes.VOTE);
      const keyPair = zok.setup(artifacts.program);
      const padron = {
        voters: cons.VOTEROLL.slice(0, parseInt(params.numberVoters, 10)),
        vote_const: params.voteConstant,
        verification_key: JSON.stringify(keyPair.vk),
      };
      console.log(Object.keys(padron));
      state = await apicc.setup(padron, state);
      state.artifacts = artifacts;
      state.pk = keyPair.pk;
      state.isInit = true;
      return new Response(cons.RESPONSE.INIT.SUCCESS, 200, state);
    } catch (e) {
      console.log(e);
      return new Response(cons.RESPONSE.INIT.ERROR, 500, e);
    }
  };

  proof.getArtifacts = async (params) => {
    try {
      if (!state.wallet) state.wallet = await fabUtils.initWallet();
      const res = await apicc.getArtifacts(state.wallet);
      const objRes = JSON.parse(res.toString());
      objRes.artifacts = state.artifacts;
      objRes.pk = state.pk;
      return new Response(
        cons.RESPONSE.ARTIFACTS.SUCCESS,
        200,
        objRes,
      );
    } catch (e) {
      return new Response(cons.RESPONSE.ARTIFACTS.ERROR, 500, e);
    }
  };

  proof.addVoteId = async (ctx) => {
    try {
      const params = ctx.request.body;
      if (!state.wallet) state.wallet = await fabUtils.initWallet();
      const res = await apicc.addId(params.id, state.wallet);
      return new Response(cons.RESPONSE.ADD.SUCCESS, 200, 'ok');
    } catch (e) {
      console.log(e);
      return new Response(cons.RESPONSE.ADD.ERROR, 500, e);
    }
  };
  proof.vote = async (ctx) => {
    try {
      const params = ctx.request.body;
      if (!state.wallet) state.wallet = await fabUtils.initWallet();
      const res = await apicc.vote(params.proof, params.value, state.wallet);
      return new Response(cons.RESPONSE.VOTE.SUCCESS, 200, res);
    } catch (e) {
      console.log(e);
      return new Response(cons.RESPONSE.VOTE.ERROR, 500, e);
    }
  };
  proof.getResult = async (params) => {
    try {
      if (!state.wallet) state.wallet = await fabUtils.initWallet();
      const res = await apicc.getResult(state.wallet);
      const objRes = JSON.parse(res.toString());
      return new Response(
        cons.RESPONSE.RESULT.SUCCESS,
        200,
        objRes,
      );
    } catch (e) {
      return new Response(cons.RESPONSE.RESULT.ERROR, 500, e);
    }
  };
  return proof;
};
