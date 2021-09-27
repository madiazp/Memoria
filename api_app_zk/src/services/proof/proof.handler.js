import validator from '../../validator';
import voterSchema from '../../schemes/voter';

export default ({ proofService }) => {
  const proof = {};

  proof.genproof = (ctx) => {
    const schema = voterSchema;
    return validator(
      schema,
      {
        private_key: ctx.request.body.private_key,
      },
      proofService.genproof,
    );
  };
  proof.initializeSystem = (ctx) => {
    const params = ctx.request.body;
    return proofService.initializeSystem(ctx, params);
  };
  proof.getArtifacts = (ctx) => {
    return proofService.getArtifacts(ctx);
  };
  proof.addVoteId = (ctx) => {
    return proofService.addVoteId(ctx);
  };
  proof.vote = (ctx) => {
    return proofService.vote(ctx);
  };
  proof.getResult = (ctx) => {
    return proofService.getResult(ctx);
  };
  proof.checkproof = (ctx) => {
    return proofService.checkproof(ctx.params.key);
  };

  return proof;
};
