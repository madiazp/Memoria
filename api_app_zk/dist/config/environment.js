'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _constants = require('./constants');

var _constants2 = _interopRequireDefault(_constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = () => {
  _dotenv2.default.config();
  let Env = {};

  switch (process.env.ENVIRONMENT) {
    case _constants2.default.ENV.PROD:
      Env = {
        api: {
          env: process.env.ENVIRONMENT,
          network: {
            apichainzk: {
              endpoints: {
                url: process.env.PROD_API_CHAIN_ZK_URL
              }
            }
          }
        }
      };
      break;
    case _constants2.default.ENV.DEV:
      Env = {
        api: {
          env: process.env.ENVIRONMENT,
          network: {
            apichainzk: {
              endpoints: {
                url: process.env.DEV_API_CHAIN_ZK_URL
              }
            }
          }
        }
      };
      break;
    default:
      Env = {
        api: {
          env: process.env.ENVIRONMENT
        }
      };
      break;
  }

  return Env;
};