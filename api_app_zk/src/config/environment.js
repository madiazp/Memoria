import dotenv from 'dotenv';
import CONSTS from './constants';

export default () => {
  dotenv.config();
  let Env = {};

  switch (process.env.ENVIRONMENT) {
    case CONSTS.ENV.PROD:
      Env = {
        api: {
          env: process.env.ENVIRONMENT,
          network: {
            apichainzk: {
              endpoints: {
                url: process.env.PROD_API_CHAIN_ZK_URL,
              },
            },
          },
        },
      };
      break;
    case CONSTS.ENV.DEV:
      Env = {
        api: {
          env: process.env.ENVIRONMENT,
          network: {
            apichainzk: {
              endpoints: {
                url: process.env.DEV_API_CHAIN_ZK_URL,
              },
            },
          },
        },
      };
      break;
    default:
      Env = {
        api: {
          env: process.env.ENVIRONMENT,
        },
      };
      break;
  }

  return Env;
};
