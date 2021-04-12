import Env from '../../config/environment';
import fab from './fabUtils';

const axios = require('axios');

const env = Env();
const apicc = {};

apicc.setup = async (padron, state) => {
  state.wallet = await fab.initWallet();
  const padronj = [JSON.stringify(padron)];
  await fab.invoke('CcSetup', padronj, state.wallet);
  state.isInit = true;
  return state;
};

apicc.vote = async (proof, value, wallet) => {
  const args = [proof, value];
  const res = await fab.invoke('CcVote', args, wallet);
  return res;
};

apicc.addId = async (id, wallet) => {
  const args = [id];
  const res = await fab.invoke('CcAddId', args, wallet);
  return res;
};

apicc.getArtifacts = async (wallet) => {
  const res = await fab.query('CcGetArtifacts', [], wallet);
  return res;
};

apicc.getResult = async (wallet) => {
  const res = await fab.query('CcGetResult', [], wallet);
  return res;
};

apicc.getAll = async (proofjson) => {
  axios.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';
  const proof = await axios.post(
    `${env.api.network.apichainzk.endpoints.url}/proof`, proofjson,
  );
  return proof.data;
};

export default apicc;
