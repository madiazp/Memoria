pub const SEGMENT_SIZE: usize = 62;

use crate::babyjubjub::{Point,from_hash,infinity};
use crate::errors::Error;

#[derive(Clone,Debug)]
pub struct pedersen_hash {
    name: String,
    generators: Vec<Point>,
    segments: usize,
    is_init: bool
}

impl pedersen_hash {
    fn gen_generators(&self) -> Result<Vec<Point>,Error>{
        let mut generators: Vec<Point> = Vec::new() ;
        let mut current: Point = infinity() ;
        let mut k: usize;
        for i in 0..self.segments {
            k = i;
            if k % SEGMENT_SIZE == 0{
                current = match pedersen_hash_basepoint(&self.name, k/SEGMENT_SIZE){
                    Err(e) => return Err(e),
                    Ok(current) => current,
                };
            }
            k = i % SEGMENT_SIZE;
            if k != 0 {
                current = current.double().double().double().double();
            }
            generators.push(current.clone());
        }
        Ok(generators)
    }

    fn hash_windows(self,windows: Vec<u32>) -> Result<Point, Error>{

        if !self.is_init {
            return Err(Error::NotInit{});
        }
        let mut segment;
        let mut result = infinity();
        for pack in self.generators.iter().zip(windows){
            let (g,win) = pack;
            segment = g * ((win & 0b11)+1);
            if win > 0b11 {
                segment = -segment;
            }

            result = result + segment;

        }
        Ok(result)
    }

    pub fn hash_bytes(mut self, name: Vec<u8>) -> Result<Point,Error>{
        let mut windows : Vec<u32>= Vec::new();
        let mut uval: u32;
        let mut gen: String=String::from("");
        //let bytes = hex::decode(&name).unwrap();
        //let lenbytes = &name.len()*4/bytes.len();
        let bytes = name;

        //let lenbytes = String::from_utf8_lossy(&bytes).len()/bytes.len();
        let lenbytes = bytes.len()/8;
        for k in bytes {
            gen = format!("{}{:0>l$b}",gen, k, l = lenbytes);
        }

        if gen.len()%3 != 0{
            gen = format!("{:0<width$}",gen,width=gen.len()+(3-gen.len()%3))
        }

        //println!("gen {}",gen);
        for i in (0..gen.len()-1).step_by(3){
            uval = u32::from_str_radix(&(gen[i..i+3].chars().rev().collect::<String>()), 2).unwrap();
            windows.push(uval);
        }

        self.segments = windows.len();
        self.generators = match self.gen_generators() {
            Err(e) => return Err(e),
            Ok(g) => g
        };
        self.is_init = true;
        self.hash_windows(windows)
    }
    pub fn hash_bytes_windows(mut self, name: Vec<u8>) -> (Result<Point,Error>, Vec<u32>){
        let mut windows : Vec<u32>= Vec::new();
        let mut uval: u32;
        let mut gen: String=String::from("");
        let bytes = name;

        let lenbytes = bytes.len()/8;
        for k in bytes {
            gen = format!("{}{:0>l$b}",gen, k, l = lenbytes);
        }

        if gen.len()%3 != 0{
            gen = format!("{:0<width$}",gen,width=gen.len()+(3-gen.len()%3))
        }

        for i in (0..gen.len()-1).step_by(3){
            uval = u32::from_str_radix(&(gen[i..i+3].chars().rev().collect::<String>()), 2).unwrap();
            windows.push(uval);
        }

        self.segments = windows.len();
        self.generators = match self.gen_generators() {
            Err(e) => return (Err(e), windows),
            Ok(g) => g
        };
        self.is_init = true;
        (self.hash_windows(windows.clone()), windows)
    }


}

fn pedersen_hash_basepoint(name: &String, i: usize)->Result<Point, Error>{
    if i > 65535 {
        return Err(Error::LargeNumber{})
    }
    let len_name = name.len();
    if len_name > 26 {
        return Err(Error::LargeNumber{})
    }
    from_hash(format!("{}{:width$}{:0>4X}",name,"",i,width=28-len_name).as_bytes())


}

pub fn new_pedersen_hasher(name: String) -> pedersen_hash {
    pedersen_hash{
        name: name,
        generators: Vec::new(),
        segments: 0,
        is_init: false
    }
}
