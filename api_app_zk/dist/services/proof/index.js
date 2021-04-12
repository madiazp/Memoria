'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _proof = require('./proof.service');

var _proof2 = _interopRequireDefault(_proof);

var _proof3 = require('./proof.handler');

var _proof4 = _interopRequireDefault(_proof3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = () => {
  const proofService = (0, _proof2.default)();
  const proofHandler = (0, _proof4.default)({ proofService });

  return {
    genproof: proofHandler.genproof,
    getArtifacts: proofHandler.getArtifacts,
    initializeSystem: proofHandler.initializeSystem,
    addVoteId: proofHandler.addVoteId,
    vote: proofHandler.vote,
    getResult: proofHandler.getResult
  };
};