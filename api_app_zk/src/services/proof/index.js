import ProofService from './proof.service';
import ProofHandler from './proof.handler';

export default () => {
  const proofService = ProofService();
  const proofHandler = ProofHandler({ proofService });

  return {
    genproof: proofHandler.genproof,
    getArtifacts: proofHandler.getArtifacts,
    initializeSystem: proofHandler.initializeSystem,
    addVoteId: proofHandler.addVoteId,
    vote: proofHandler.vote,
    getResult: proofHandler.getResult,
  };
};
