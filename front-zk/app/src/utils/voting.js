import HASH from '../codes/hash';
import CONST from '../config/constant';
import apicc from '../helpers/apicc';
import format from '../helpers/format';
import { initialize } from 'zokrates-js';

const voting = async (toHash, setter, results, vote) => {
    try {
    console.log(toHash);
    const hasher = await import('witness');
    setter(1);
    const to_witness = hasher.genHash(toHash);
    const vote_hash = hasher.genHash(vote);
    const nullifier = hasher.genNullifier(toHash);
    const format_witness = format.toZokFormat8(to_witness);
    const format_vote = format.toZokFormat8(vote_hash);
    const format_nullifier = format.toZokFormat8(nullifier);
    setter(2);
    const zok = await initialize();
    setter(3);
    const systemArtifacts = await apicc.getArtifacts();
    console.log(systemArtifacts);
    setter(4);
    const vote_sign = hasher.voteSign(vote, systemArtifacts.voteConst.value);
    const format_sign = format.toZokFormat8(vote_sign);
    const { witness, output } = zok.computeWitness(systemArtifacts.artifacts,
        [
            format_witness,
            systemArtifacts.voteRoll,
            format_vote,
            systemArtifacts.voteConst.hash,
            format_nullifier,
            format_sign,
        ],
    );
    setter(5);
    console.log(output);
    const proof = zok.generateProof(systemArtifacts.artifacts.program, witness, systemArtifacts.pk);
    setter(6);
    console.log(proof);
    console.log(format_sign);
    const proofj = JSON.stringify(proof)
    const res = await apicc.sendVote(proofj, vote);
    results(` answer: ${res}`);
    } catch (err){
      setter(undefined);
      alert(err.payload || err);
    }
}

export default voting;
