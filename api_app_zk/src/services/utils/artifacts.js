import con from '../../config/constants';

const fs = require('fs').promises;
const path = require('path');

const readFile = async (filename) => {
  const filepath = path.resolve(__dirname, `../../${filename}`);
  const resp = await fs.readFile(filepath, 'utf8');
  return resp;
};

const getOut = async () => {
  const resp = await readFile(con.FILES.OUT);
  return resp;
};

const getProverKey = async () => {
  return readFile(con.FILES.PROVER);
};

export default {
  getOut,
  getProverKey,

};
