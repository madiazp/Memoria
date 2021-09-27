# README #



### What is this repository for? ###

ZK-SNARK API based on [ZoKrates](https://zokrates.github.io/). This project have the api that generate zk-snark proof of the voters.


### Packages ###

The eddsa and pedersen fucntionalities come from the [pycrypto](https://github.com/Zokrates/pycrypto) package. The package was build to work with the ZoKrates DSL. 

The zk-snark proof are generated with [ZoKrates](https://zokrates.github.io/) client. A Tool Box for zk-snark. the logic are in the zokrates_zk repository.

### Files ###
- /src :

	- index.js: contains the routes of the endpoints.

	- services: concentrate the functionalities of the project:
	
			- proof: has the endpoints and the validation middleware.
			
			- utils: has the proof generation tools and extern api conections tools.
	- static: constains the static files and scripts needed to make the proofs. It has its own keys.py (a modified version of the one in the zokrates_zk repository), the compiled code of the zokrates logic, the proving key and the script that make the proofs.
	
	- schemes/validators: scheme has the definition of the body spected by the validators from the in-comming requests.
	
	- responses/error: Contains the format 

zk_lib: the project that exports the zokrates functions to nodejs. Work in progress.

### Make it work ###

The chain init values are created with the command:


