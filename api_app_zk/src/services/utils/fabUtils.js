import CONST from '../../config/constants';

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');

const fabUtils = {};

const connect = async (methodName, args, wallet, isInvoke) => {
  const identity = await wallet.get(CONST.FAB.IDENTITY);
  if (!identity) {
    throw Error('An identity for the user does not exist in the wallet');
  }
  const gateway = new Gateway();
  const ccp = JSON.parse(fs.readFileSync(CONST.FAB.CCP, 'utf8'));

  await gateway.connect(
    ccp,
    {
      wallet,
      identity: CONST.FAB.IDENTITY,
      discovery: { enabled: true, asLocalhost: true },
    },
  );
  const network = await gateway.getNetwork(CONST.FAB.CHANNEL);
  const contract = network.getContract(CONST.FAB.CHAINCODE);
  let tx;
  if (isInvoke) {
    tx = await contract.submitTransaction(methodName, ...args);
  } else {
    tx = await contract.evaluateTransaction(methodName, ...args);
  }
  await gateway.disconnect();
  return tx;
};

fabUtils.initWallet = async () => {
  const wallet = await Wallets.newInMemoryWallet();
  const cert = fs.readFileSync(CONST.FAB.CERT).toString();
  const key = fs.readFileSync(CONST.FAB.KEY).toString();

  const identity = {
    credentials: {
      certificate: cert,
      privateKey: key,
    },
    mspId: 'Org1MSP',
    type: 'X.509',
  };

  await wallet.put(CONST.FAB.IDENTITY, identity);
  return wallet;
};

fabUtils.query = async (methodName, args, wallet) => connect(methodName, args, wallet, false);
fabUtils.invoke = async (methodName, args, wallet) => connect(methodName, args, wallet, true);

export default fabUtils;
