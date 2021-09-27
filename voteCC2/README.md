# README #



## Chaincode ##

Chaincode of the voting system. This chaincodes provides the methods


## Description ##
The main methods can be separated in two categories:
### Invoke ###
Methods that change the state of the blockchain
* CcSetup: Works as a constructor. It initialize the blockchain with the data needed for the system to work. Like the vote roll and te zk-snarks keys.
* CcAddId: Add an id on the vote roll.
* CcVote: Verifies the zk-snark and all the artifacts, and asserts that the nullifier is unique, then add the vote to the blockchain.

### Get ###
Methods that only reads and retrieve tings on the blockchain.
* CcGetArtifacts: Retrieve all the artifacts needed by the client to produce a ZK-SNARK.
* CcGetResult: Counts the votes an returns the result.


