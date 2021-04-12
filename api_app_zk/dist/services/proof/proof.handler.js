'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _validator = require('../../validator');

var _validator2 = _interopRequireDefault(_validator);

var _voter = require('../../schemes/voter');

var _voter2 = _interopRequireDefault(_voter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = ({ proofService }) => {
  const proof = {};

  proof.genproof = ctx => {
    const schema = _voter2.default;
    return (0, _validator2.default)(schema, {
      private_key: ctx.request.body.private_key
    }, proofService.genproof);
  };
  proof.initializeSystem = ctx => {
    const params = ctx.request.body;
    return proofService.initializeSystem(ctx, params);
  };
  proof.getArtifacts = ctx => {
    return proofService.getArtifacts(ctx);
  };
  proof.addVoteId = ctx => {
    return proofService.addVoteId(ctx);
  };
  proof.vote = ctx => {
    return proofService.vote(ctx);
  };
  proof.getResult = ctx => {
    return proofService.getResult(ctx);
  };
  proof.checkproof = ctx => {
    return proofService.checkproof(ctx.params.key);
  };

  return proof;
};