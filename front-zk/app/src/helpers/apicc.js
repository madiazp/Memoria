import axios from 'axios';
import CONST from '../config/constant';

const apicc = {};

apicc.registerId = async (id) => {
  const res = await axios.post(
    `${CONST.API.url}/addId`,
    { id },
  );
    return res;
};

apicc.getArtifacts = async () => {
    const artifacts = await axios.get(
        `${CONST.API.url}/artifacts`,
    );
    return artifacts.data.payload;
};

apicc.setup = async (voteConstant, numberVoters) => {
  const formatter = w => JSON.parse(w).map((x) =>'0x'+ x.toString(16).padStart(8,"0"));
  const voteObject = {
    value: voteConstant,     
  };
  const hasher = await import('witness');
  const constHash = hasher.genHash(voteConstant);
  voteObject.hash = formatter(constHash);
  const res = await axios.post(
    `${CONST.API.url}/init`,
    {
      voteConstant: voteObject,
      numberVoters,
    },
  );
  return res.data.message;
};

apicc.getStadistics = async () => {
   const res = await axios.get(
     `${CONST.API.url}/results`,
   );
   return res.data.payload;
};

apicc.sendVote = async (proof, value) => {
    const req = {
        proof,
        value,
    };
    const res = await axios.post(
        `${CONST.API.url}/vote`,
        req,
    );
    console.log(res.data);
    if (res.data.code !== 200) {
        throw Error(res.data.payload.message);
    }
    return res.data.message;
};

export default apicc;
