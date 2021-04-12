use crate::babyjubjub::{Point, generator, JUBJUB_E};
use crate::errors::Error;
use crate::field::{FQ,newFQ};

//extern crate rug;
extern crate data_encoding;
extern crate num_bigint;
extern crate sha2;
extern crate num_traits;
extern crate num_integer;

//use self::rug::{BigInt, BigInt::Order, ops::RemRounding};
use self::data_encoding::HEXLOWER;
use self::num_bigint::{BigInt,Sign::Plus};
use self::sha2::{Sha256, Digest};
use self::num_traits::Num;
use self::num_integer::Integer;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern {

    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

}
#[derive(Clone)]
pub struct PrivateKey {
    pub fe: FQ,
}


impl PrivateKey {
    pub fn fromSecret( secret: String )-> Result<Self,Error>{
        let entropy = secret.as_bytes();
        let to_parse_big_int = BigInt::from_bytes_le(Plus,Sha256::digest(entropy).as_slice());
        Ok(PrivateKey{
            fe: newFQ(to_parse_big_int),
        })
    }

    pub fn Sign(self, msg: &[u8])-> Result<(Point, BigInt),Error>{
        let gen = generator();
        let pubk = PublicKey::fromPrivate(&self);
        let (_,feb) = self.fe.n.to_bytes_be();
        let hkm = [feb, msg.to_vec()].concat();
        let r = match hashToScalar(&hkm) {
            Ok(r) => r,
            Err(e) => return Err(e),
        };

        let erre = &gen * r.clone();
        let ram =  [erre.to_bits(),pubk.pubk.to_bits() ,msg.to_vec()].concat();
        let hram = match hashToScalar(&ram){
            Ok(hram) => hram,
            Err(e) => return Err(e),
        };

        let ese = (r + self.fe.n * hram).mod_floor(&BigInt::from_str_radix(&JUBJUB_E, 10).unwrap());
        Ok((erre,ese))
    }
}

#[derive(Clone)]
pub struct PublicKey {
    pub pubk: Point,
}

impl PublicKey {
    pub fn fromPrivate( pv: &PrivateKey)-> Self {
        let gen = generator();
        PublicKey{
            pubk: &gen * pv.fe.clone().n
        }
    }

    pub fn Verify(self, rR: Point, sS: BigInt, msg: &[u8])-> Result<bool,Error> {
        let gen = generator();
        let lhs = &gen * sS;
        let ram = [rR.to_bits(),self.pubk.to_bits(), msg.to_vec()].concat();

        let hram = match hashToScalar(&ram){
            Ok(hram) => hram,
            Err(e) => return Err(e),
        };

        let rhs = (rR+ &self.pubk * hram);
        Ok(lhs.eq(&rhs))
    }
}


fn hashToScalar(entropy: &[u8]) -> Result<BigInt,Error>{

    let to_parse_big_int = BigInt::from_bytes_be(Plus,Sha256::digest(entropy).as_slice()).to_str_radix(10);
    match BigInt::from_str_radix(&to_parse_big_int,10){
        Ok(t) => Ok(t),
        Err(e) => {
            println!("error{}",e);
            return Err(Error::Invalid{});
        }
    }
}
