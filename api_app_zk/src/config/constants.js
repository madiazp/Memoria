export default {
  ENV: {
    DEV: 'dev',
    PROD: 'prod',
  },
  AXIOS: {
    TIMEOUT: 1000,
  },
  VOTEROLL: [
    ['0xa113bbda', '0x2e966be3', '0x31620465', '0xbfeb112a', '0x7a72e748', '0xdc3a4109', '0x985c910a', '0xe58d97d8'],
    ['0x189a81df', '0x425b8f4d', '0x0a8a9712', '0x68635308', '0x72913431', '0x7a402dab', '0xbd181ba6', '0xe999e085'],
    ['0x1ec2eb01', '0xc31bfb06', '0x9d91ca38', '0x5492483f', '0x0dc4d677', '0xd4663ee1', '0x75ceb12e', '0x645af36c'],
    ['0x8733d709', '0x16dafe1b', '0xceed8706', '0x90c52c98', '0xb3092923', '0xa115b5ef', '0x9d1ac8fb', '0xac084ab8'],
    ['0x2bc384ab', '0xae5fd824', '0x0c89972f', '0x2ea6c1fd', '0x25b351db', '0xabad001d', '0xea7a8120', '0x10ca22e5'],
    ['0xcc581ef5', '0x3cf5d1ea', '0xce36dae2', '0x6bd9dc82', '0x3c041514', '0x3d22114f', '0x25dea326', '0x00000000'],
    ['0x97fe37b0', '0x88d8dcaf', '0x3a64fa86', '0x12d10513', '0xe5f0ee0b', '0xdb6f2cfb', '0xf1b51c7e', '0xf997af13'],
    ['0x875ae4c1', '0x26bda69b', '0xa66dc591', '0x4d4dd54e', '0xdad12d62', '0x76541284', '0x9eb2288b', '0xdbbf516c'],
    ['0xa095e3aa', '0x5e6dfee2', '0x80068276', '0x6c78c497', '0x3716adcc', '0x3dbaf510', '0x4aa5a960', '0x9ab5f7fe'],
    ['0x18438dea', '0xb62c8518', '0x59be14d4', '0xb334c457', '0x7c151359', '0xe43ad885', '0x1627e1c6', '0x20ed59c1'],
  ],
  FILES: {
    OUT: 'out',
    PROVER: 'proving.key',
  },
  SCRIPT: {
    KEY: 'keys.py',
    PROOF: 'wit.sh',
  },
  FAB: {
    CHANNEL: 'demo',
    CHAINCODE: 'voteCC',
    CCP: '/home/matias/Memoria/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json',
    IDENTITY: 'User1@org1.example.com',
    KEY: '/home/matias/Memoria/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore/priv_sk',
    CERT: '/home/matias/Memoria/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/signcerts/User1@org1.example.com-cert.pem',
  },
  ERRORS: {
    CHECK: {
      MSG: 'Error retrieving the proof from server',
      CODE: 500,
    },
    PUSH: {
      MSG: 'Error in the proof generation',
      CODE: 500,
    },
  },
  SUCCESS: {
    CHECK: {
      MSG: 'Success in retrieving the proof',
      CODE: 200,
    },
    PUSH: {
      MSG: 'Success in generating and saving the proof',
      CODE: 200,
    },
  },
};
