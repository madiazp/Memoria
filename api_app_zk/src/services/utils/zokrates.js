import conf from '../../config/constants';

const { spawnSync } = require('child_process');
const path = require('path');

const pyscript = conf.SCRIPT.KEY;
const script = conf.SCRIPT.PROOF;

const rawWitness = async (rut, mt) => {
  const filepath = path.resolve(__dirname, `../../${pyscript}`);
  const witnessRaw = spawnSync('python3', [filepath, 'witness', rut, mt], { cwd: path.resolve(__dirname, '../../') });
  return witnessRaw.stdout.toString();
};

const scriptProof = async (filepath, witness) => {
  const proof = await spawnSync(filepath, [witness.toString()], { cwd: path.resolve(__dirname, '../../') });
  return proof.stdout.toString();
};

const genProof = async (rut, mt) => {
  const filepath = path.resolve(__dirname, `../../${script}`);
  const witness = await rawWitness(rut, mt);
  const resp = await scriptProof(filepath, witness);
  return resp;
};

export default {
  rawWitness,
  genProof,
};
