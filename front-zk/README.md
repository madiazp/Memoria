# ZK Front #

A web application to vote anonymously backed with a blockchain infraestructure .

Develop on [Reactjs](https://reactjs.org/) using [WASM](https://webassembly.org/) compiled from rust and [ZoKrates](https://github.com/Zokrates/ZoKrates).

## Requeriments ##

* [Nodejs](https://nodejs.org/es/) stable version.
* [wasm-pack](https://github.com/rustwasm/wasm-pack).

## How do I get set up? ##

* Compile to wasm the rust lib with `wasm-pack build`
* Add a link (or publish the npm module) for the js files generated: `npm link` on the pkg/ folder.
* Change to App/ folder on the root and complete the link with: `npm link witness`.
* install the package if needed with: `npm install`.
* run react application with: `npm start`.

## About the wasm module ##

The wasm module is compiled from a rust. The goal of this witness lib is to generate the zokrates witness inputs in the correct format while being wasm compatible.
