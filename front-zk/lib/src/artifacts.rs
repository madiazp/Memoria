use crate::eddsa::{PrivateKey,PublicKey};
use crate::errors::Error;
use crate::babyjubjub::{Point,infinity};
use crate::pedersen_hash::{new_pedersen_hasher};

extern crate core;
extern crate rand;
//extern crate rug;
extern crate data_encoding;
extern crate serde_json;
extern crate serde;
extern crate num_bigint;
extern crate num_traits;
extern crate hex;

use self::core::mem;
use self::data_encoding::HEXLOWER;
use self::rand::{ChaChaRng,Rng};
use self::serde_json::json;
use self::num_bigint::BigInt;
use self::num_traits::Num;
use wasm_bindgen::prelude::*;
use self::serde::Deserialize;

#[macro_use]
mod log2{
    macro_rules! log_of {
        ($val:expr, $base:expr, $type:ty) => {
             ($val as f32).log($base) as $type
        }
    }
}



#[wasm_bindgen]
extern {

    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

}


#[derive(Clone, Deserialize)]
pub struct JsonMT {
    pub root: String,
    pub inner_nodes: Vec<Vec<String>>,
    pub leafs: Vec<String>,
    pub h: usize,
    pub n: usize,

}

impl JsonMT {
    pub fn to_merkletree(self)->Result<MerkleTree,Error>{
        let root = match Point::decompress(&hex::decode(self.root).unwrap()){
            Ok(r) => r,
            Err(e) => return Err(e),
        };
        let mut leafs: Vec<Point> = Vec::new();
        for leaf in self.leafs {
            leafs.push(match Point::decompress(&hex::decode(leaf).unwrap()){
                Ok(r) => r,
                Err(e) => return Err(e),
            });
        }
        let mut inner_nodes: Vec<Vec<Point>> = Vec::new();
        for node_row in self.inner_nodes {
            let mut nodes: Vec<Point> = Vec::new();
            for inode in node_row {
                nodes.push(match Point::decompress(&hex::decode(inode).unwrap()){
                    Ok(r) => r,
                    Err(e) => return Err(e),
                });
            }

            inner_nodes.push(nodes);
        }
        Ok(MerkleTree{
            root: root,
            inner_nodes: inner_nodes,
            leafs: leafs,
        })
    }
}
///////////// STRUCTS ////////
#[derive(Clone)]
pub struct MerkleTree{
    pub root: Point,
    pub inner_nodes: Vec<Vec<Point>>,
    pub leafs: Vec<Point>
}

impl MerkleTree {
    pub fn width(&self)->usize{
        self.leafs.len()
    }

    pub fn hight(&self)->usize{
        self.inner_nodes.len()+1
    }

    pub fn stringify(&self)->String{
        let mut jinodes: Vec<Vec<String>> = Vec::new();
        let mut jleafs: Vec<String> = Vec::new();

        for leaf in &self.leafs {
            jleafs.push(HEXLOWER.encode(&leaf.clone().compress()));
        }

        for inode_floor in &self.inner_nodes {
            let mut jinodes_buffer: Vec<String> = Vec::new();
            for inode in inode_floor{
                jinodes_buffer.push( HEXLOWER.encode(&inode.clone().compress()));
            }
            jinodes.push(jinodes_buffer);
        }

        let jroot = HEXLOWER.encode(&self.clone().root.compress());
        json!({
            "root": jroot,
            "leafs": jleafs,
            "inner_nodes": jinodes,
            }).to_string()
    }
}
//////////// Pedersen //////////

pub fn HashPoint(pleft: Point,pright: Point)->Result<Point,Error>{
    let (mut pleft_comp, mut pright_comp) = (pleft.compress(),pright.compress());
    let (pl_len,pr_len) = (pleft_comp.len(), pright_comp.len());

    if  pl_len < 32 {
        pleft_comp = [vec![0;32-pl_len],pleft_comp].concat();
    }

    if pr_len < 32 {
        pright_comp = [vec![0;32-pr_len],pright_comp].concat();
    }
    let to_hash = [pleft_comp,pright_comp].concat();
    let hasher = new_pedersen_hasher(String::from("test"));
    hasher.hash_bytes(to_hash)

}

pub fn HashPointRef<'a>(pleft: &'a Point,pright: &'a Point)->Result<Point,Error>{
    let (mut pleft_comp, mut pright_comp) = (pleft.clone().compress(),pright.clone().compress());
    let (pl_len,pr_len) = (pleft_comp.len(), pright_comp.len());

    if  pl_len < 32 {
        pleft_comp = [vec![0;32-pl_len],pleft_comp].concat();
    }

    if pr_len < 32 {
        pright_comp = [vec![0;32-pr_len],pright_comp].concat();
    }
    let to_hash = [pleft_comp,pright_comp].concat();
    let hasher = new_pedersen_hasher(String::from("test"));
    hasher.hash_bytes(to_hash)

}

pub fn RanHash()->Result<Point,Error>{
    let rng = u32_vec(ChaChaRng::new_unseeded().next_u32());
    let hasher = new_pedersen_hasher(String::from("test"));
    hasher.hash_bytes(rng)

}


//////////// KEYS ///////////
pub fn GenFromRut(rut: String)->Result<PrivateKey,Error>{
    PrivateKey::fromSecret(rut)
}

pub fn PubFromSecret(fe: String)->Result<PublicKey,Error>{
    let pk = match PrivateKey::fromSecret(fe) {
        Ok(pk) => pk,
        Err(e) => return Err(e)
    };

    let pubk = PublicKey::fromPrivate(&pk);
    Ok(pubk)
}

/////////// EDDSA //////////////

pub fn SignObj(pk: PrivateKey, root: &[u8]) -> Result<(Point,BigInt,String),Error>{
    let (r,s) = match pk.Sign(root){
        Ok((r,s)) => (r,s),
        Err(e) => return Err(e),
    };

    let m = HEXLOWER.encode(root);
    let b0 = format_msg(&m[..64]);
    let b1 = format_msg(&m[64..]);
    Ok((r,s,format!("{}",b0+&b1)))

}


pub fn GenMerkleTree(voters_pk: Vec<String>, mtsize: usize) -> Result<MerkleTree,Error>{
    let mut pubk: PublicKey;
    let mut leafs: Vec<Point> = Vec::new();
    let mut leaf: Point;
    for secret in voters_pk {

        pubk = match PubFromSecret(secret){
            Ok(pubk) => pubk,
            Err(e) => return Err(e),
        };
        leaf = match HashPoint(pubk.clone().pubk, pubk.pubk){
            Ok(leaf) => leaf,
            Err(e) => return Err(e),
        };

        leafs.push(leaf);
    }
    let leafs_size = leafs.len();
    if leafs_size < mtsize {
        for _ in 0..(mtsize-leafs_size){
            let ranhash = match RanHash() {
                Ok(rhash) => rhash,
                Err(e) => return Err(e),
            };
            leafs.push(ranhash);
        }
    }
    let mut inodes: Vec<Vec<Point>> = Vec::new();
    for k in 0..log_of!(mtsize,2.,usize)-1{
        if k == 0 {
            let mtp = match makeParent(&leafs){
                Ok(mtp) => mtp,
                Err(e) => return Err(e),
            };
            inodes.push(mtp);
        } else {
            let mtp = match makeParent(&inodes[k-1]){
                Ok(mtp) => mtp,
                Err(e) => return Err(e),
            };

            inodes.push(mtp);
        }
    }
    let root = match makeParent(match inodes.last() {
        Some(p) => p,
        None => return Err(Error::Invalid{}),
    }) {
         Ok(r) => r.last().unwrap().clone(),
         Err(e) => return Err(e),
    };

    Ok(MerkleTree{
        leafs: leafs,
        inner_nodes: inodes,
        root: root,
    })
}

pub fn getPath(mt: MerkleTree, pb: PublicKey ) -> Result<(Vec<String>,Vec<u8>),Error>{
    let mut mtx: u8 = 0;
    let mut partner: Point= infinity();
    let mut parent: Point = infinity();
    let mut mtxs: Vec<u8>= Vec::new();
    let mut partners: Vec<String> = Vec::new();

    let pub_hash = match HashPoint(pb.clone().pubk, pb.pubk){
        Ok(leaf) => leaf,
        Err(e) => return Err(e),
    };
    for k in 0..mt.hight()-1{
        if k == 0{
            let (mut mtx_t,mut partner_t, mut parent_t) = match getPartner(&pub_hash, &mt.leafs) {
                Ok((mtx,prner,prent)) => (mtx,prner,prent),
                Err(e) => return Err(e),
            };
            mem::swap(&mut mtx_t, &mut mtx);
            mem::swap(&mut partner_t, &mut partner);
            mem::swap(&mut parent_t, &mut parent);

        } else {
            let (mut mtx_t, mut partner_t, mut parent_t) = match getPartner(&parent, &mt.inner_nodes[k-1]) {
                Ok((mtx,prner,prent)) => (mtx,prner,prent),
                Err(e) => return Err(e),
            };
            mem::swap(&mut mtx_t, &mut mtx);
            mem::swap(&mut partner_t, &mut partner);
            mem::swap(&mut parent_t, &mut parent);
        }
        mtxs.push(mtx);
        partners.push(partner.to_witformat());
    }
    Ok((partners,mtxs))
}

fn getPartner(node: &Point, node_list: &Vec<Point>) -> Result<(u8,Point,Point),Error>{
    let mut mtx: u8 = 0;
    let mut partner: Point= infinity();
    let mut parent: Point= infinity();
    for k in 0..node_list.len(){
        if node.clone().eq(&node_list[k]){
            if k%2!=0{
                mtx = 1;
                let buffer = &node_list[k-1];
                parent = match HashPointRef(buffer, &node) {
                    Ok(p)=> p,
                    Err(e) => return Err(e),
                };
                partner = buffer.clone();
            } else {
                mtx = 0;
                let buffer = &node_list[k+1];
                parent = match HashPointRef(&node,buffer) {
                    Ok(p)=> p,
                    Err(e) => return Err(e),
                };
                partner = buffer.clone();
            }
        }
    }
    Ok((mtx,partner,parent))
}


fn makeParent(childs: &Vec<Point>)->Result<Vec<Point>,Error>{
    let mut i: usize = 0;
    let mut parents: Vec<Point> = Vec::new();
    for k in childs {

        if i % 2 != 0 {
            let parent = match HashPointRef(&childs[i-1],k){
                Ok(p) => p,
                Err(e) => return Err(e),
            };

            parents.push(parent);
        }
        i += 1;
    }
    Ok(parents)
}
///////////// WITNESS ////////////////////

pub fn GenWitness(secret: String, mt: MerkleTree)->Result<String, Error>{
    let pk = PrivateKey::fromSecret(secret.clone()).unwrap();

    let pb = match PubFromSecret(secret){
        Ok(pb) => pb,
        Err(e) => return Err(e),
    };
    let (path,mx) = match getPath(mt.clone(), pb.clone()){
        Ok(res) => res,
        Err(e) => return Err(e),
    };
    let mut to_sign =  mt.clone().root.compress();
    let ts_len = to_sign.len();
    if  ts_len < 32 {
            to_sign = [vec![0;32-ts_len],to_sign].concat();
    }
    to_sign = [to_sign.clone(),to_sign].concat();
    let (r,s, msg) = match SignObj(pk, &to_sign){
        Ok(sobj) => sobj,
        Err(e) => return Err(e),
    };
    let mut path_str: String = String::new();
    let mut mtx_str: String = String::new();
    for k in 0..path.len(){
        path_str = format!("{} {}", path_str, path[k]);
        mtx_str = format!("{} {}", mtx_str, mx[k]);
    }
    let nullifier = HashPointRef(&r.clone(),&r).unwrap();
    Ok(format!("{} {} {}{}{}{} {} {}",r.to_witformat(),s, pb.pubk.to_witformat(), msg, path_str, mtx_str, mt.root.to_witformat(), nullifier.to_witformat() ))
}

//////////////// AUXILIARS ///////////////

fn u32_vec(x:u32) -> Vec<u8> {
    let b1 : u8 = ((x >> 24) & 0xff) as u8;
    let b2 : u8 = ((x >> 16) & 0xff) as u8;
    let b3 : u8 = ((x >> 8) & 0xff) as u8;
    let b4 : u8 = (x & 0xff) as u8;
    return vec!(b1, b2, b3, b4)
}

fn format_msg(m: &str) -> String {
    let b = format!("{:0>256b}",BigInt::from_str_radix(m, 16).unwrap());
    println!("b_int: {}",b);
    b.chars()
              .enumerate()
              .fold(String::new(), |acc,(_,c)|{
                  format!("{} {}",acc,c)
                  })


}
