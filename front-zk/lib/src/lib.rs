/*
lib for the generation of voter proof of habilitation.
See README.

Use ZoKrates lib for contruction of ZK-SNARKs and the zokrates_zk lib
for the contructions of artifacts.
See the zokrates_zk documentation and source code for futher information.

This lib is suited for WASM so its implementation differ from the zokrates_zk in some aspects.

*/
extern crate wasm_bindgen;
extern crate serde_json;
extern crate console_error_panic_hook;
extern crate serde;
extern crate bincode;

use wasm_bindgen::prelude::*;
use std::char;

mod field;
mod babyjubjub;
mod pedersen_hash;
mod math_utils;
mod errors;
mod eddsa;
mod artifacts;

use serde::{Deserialize, Serialize};
use serde_json::to_string_pretty;
use bincode::{deserialize, deserialize_from, serialize_into, serialize };

// loggin from js app
#[wasm_bindgen]
extern {
    fn alert(s: &str);

    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

}
use artifacts::HashPoint;
// make the witness format for zokrates and then call it

// format witnnes fro zokrates
// Proof generator, take the program bytes, the prover key and the formatted witness to make the proof.
#[wasm_bindgen]
pub fn genHash(secret: String) ->  String {
    let hasher = pedersen_hash::new_pedersen_hasher(String::from("test"));
    let (res, win) = hasher.hash_bytes_windows(Vec::from(secret.as_bytes()));
    match res {
        Ok(v) =>format!("{:?}", v.to_u32_vec()),
        Err(_) => String::from("algo malio sal")
    }
}
#[wasm_bindgen]
pub fn genSecretAndId(secret: String) -> (String) {
    let hasher = pedersen_hash::new_pedersen_hasher(String::from("test"));
    let res = hasher.hash_bytes(Vec::from(secret.as_bytes()));
    let SecretPoint: babyjubjub::Point = res.unwrap_or(babyjubjub::infinity());
    let Id: babyjubjub::Point = artifacts::HashPoint(SecretPoint.clone(), SecretPoint.clone())
        .unwrap_or(babyjubjub::infinity());
    format!("{:?};{:?}", SecretPoint.to_u32_vec(), Id.to_u32_vec())
}

#[wasm_bindgen]
pub fn genId(secret: String) -> (String) {
    let hasher = pedersen_hash::new_pedersen_hasher(String::from("test"));
    let (res, _) = hasher.hash_bytes_windows(Vec::from(secret.as_bytes()));
    let SecretPoint: babyjubjub::Point = res.unwrap_or(babyjubjub::infinity());
    let Id: babyjubjub::Point = artifacts::HashPoint(SecretPoint.clone(), SecretPoint)
        .unwrap_or(babyjubjub::infinity());
    format!("{:?}", Id.to_u32_vec())
}

#[wasm_bindgen]
pub fn genNullifier(secret: String) -> (String) {
    let hasher = pedersen_hash::new_pedersen_hasher(String::from("test"));
    let res = hasher.hash_bytes(Vec::from(secret.as_bytes()));
    let SecretPoint: babyjubjub::Point = res.unwrap_or(babyjubjub::infinity());
    let addr: babyjubjub::Point = artifacts::HashPoint(SecretPoint.clone(), SecretPoint.clone())
        .unwrap_or(babyjubjub::infinity());
    let nullifier: babyjubjub::Point = artifacts::HashPoint(SecretPoint, addr)
        .unwrap_or(babyjubjub::infinity());
    format!("{:?}", nullifier.to_u32_vec())
}


#[wasm_bindgen]
pub fn voteSign(vote: String, constVote: String ) -> (String) {
    let hasher = pedersen_hash::new_pedersen_hasher(String::from("test"));
    let hasher2 = pedersen_hash::new_pedersen_hasher(String::from("test"));
    let voteHash = hasher.hash_bytes(Vec::from(vote.as_bytes())).unwrap_or(babyjubjub::infinity());
    let constHash = hasher2.hash_bytes(Vec::from(constVote.as_bytes())).unwrap_or(babyjubjub::infinity());
    let commit: babyjubjub::Point = artifacts::HashPoint(voteHash, constHash)
        .unwrap_or(babyjubjub::infinity());
    format!("{:?}", commit.to_u32_vec())
}
