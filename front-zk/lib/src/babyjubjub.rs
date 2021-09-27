extern crate num_bigint;
extern crate sha2;
extern crate data_encoding;

//extern crate rug;
extern crate num_traits;
extern crate num_integer;

use self::data_encoding::HEXLOWER;
use self::sha2::{Sha256, Digest};
use self::num_bigint::{BigInt,Sign::Plus};
use wasm_bindgen::prelude::*;
//use self::rug::{BigInt,BigInt::Order};
use std::ops::{Add, Mul, Neg};
use crate::field::{FIELD_MODULUS, FQ, zero, one, equals, newFQ };
use crate::math_utils::{square_root_mod_prime};
use crate::errors::Error;
use self::num_traits::cast::FromPrimitive;
use self::num_traits::{Num,One};
use std::ops::Shl;
use std::convert::TryInto;

// order of the field
pub const JUBJUB_Q: &str = FIELD_MODULUS;
// order of the curve
pub const JUBJUB_E: &str = "21888242871839275222246405745257275088614511777268538073601725287587578984328";
pub const JUBJUB_C: &str = "8";  // Cofactor
pub const JUBJUB_L: &str = JUBJUB_E; // JUBJUB_C  # C*L == E
pub const JUBJUB_A: &str = "168700";  // Coefficient A
pub const JUBJUB_D: &str = "168696";  // Coefficient D
pub const GENERATOR_X: &str = "16540640123574156134436876038791482806971768689494387082833631921987005038935";
pub const GENERATOR_Y: &str = "20819045374670962167435360035096875258406992893633759881276124905556507972311";

#[wasm_bindgen]
extern {

    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

}

#[derive(Clone,Debug)]
pub struct Point {
    x: FQ,
    y: FQ,
}

impl Point {
    pub fn y(self) -> FQ{
        self.y
    }
    pub fn to_string(&self)->String{
        format!("x: {}, y: {}", self.x.n,self.y.n)
    }
    pub fn to_witformat(&self) -> String {
        format!("{} {}",self.x.n, self.y.n)
    }
    pub fn to_bits(&self) -> Vec<u8>{
        let (_,k) = self.x.n.to_bytes_be();
        k
        //[self.x.n.to_digits::<u8>(Order::MsfBe), self.y.n.to_digits::<u8>(Order::MsfBe)].concat()
    }
    pub fn to_u32_vec(&self) -> Vec<u32>{
        let self_u8 = self.clone().compress();
        self_u8
            .chunks(4)
            .map(|x| {
                let vec_4: [u8;4] = x.try_into().unwrap_or([0,0,0,0]);
                u32::from_be_bytes(vec_4)
            })
            .collect::<Vec<u32>>()
    }
    pub fn valid(self) -> bool{
        let (bigjubA, bigjubD) = (BigInt::from_str_radix(JUBJUB_A,10).unwrap(), BigInt::from_str_radix(JUBJUB_D,10).unwrap());
        let xdouble = self.x.clone().n * self.x.n;
        let ydouble = self.y.clone().n * self.y.n;
        (bigjubA*xdouble.clone())+ydouble.clone() == (BigInt::from(1)+bigjubD*xdouble*ydouble)
    }

    pub fn double(self)-> Self {
      &self + &self
    }

    pub fn double_ref(&self)-> Self {
      self + self
    }

    pub fn eq(&self, toeq: &Point) -> bool{
        self.x.n == toeq.x.n && self.y.n == toeq.y.n
    }

    pub fn compress(self) -> Vec<u8>{
        let x = self.x.n;
        let y = self.y.n;
        let to_assign: BigInt = y | (x & BigInt::one()) << 255;

        let (_,k)= to_assign.to_bytes_be();
        k
    }
    pub fn decompress(data: &[u8])->Result<Self,Error>{
        if data.len() != 32 {
            return Err(Error::SizeErr{s: data.len()});
        }


        let mut y = BigInt::from_bytes_be(Plus,data);
        let sg = &y >> 255;
        let oe: BigInt = BigInt::one();
        let shifted = oe.shl(255);
        y &= (shifted - 1);
        let to_parse_big_int = y.clone().to_str_radix(10);

        let to_parse_sg = sg.to_str_radix(10);
        let yI = match BigInt::from_str_radix(&to_parse_big_int,10){
            Ok(t) => t,
            Err(e) => {
                println!("error{}",e);
                return Err(Error::Invalid{});
            }
        };

        let sgI = match BigInt::from_str_radix(&to_parse_sg,10){
            Ok(t) => t,
            Err(e) => {
                println!("error{}",e);
                return Err(Error::Invalid{});
            }
        };

        from_signed_y(&newFQ(yI),sgI)
    }
}
impl Add for Point {

    type Output = Point;
    fn add(self, toadd: Point) -> Self{
      let (bigjubA, bigjubD) = (BigInt::from_str_radix(JUBJUB_A,10).unwrap(), BigInt::from_str_radix(JUBJUB_D,10).unwrap());
      if equals(&self.x, &zero()) && equals(&self.y, &zero()) {
           let zero = toadd.clone();
           return zero;
       }
       let (u1,v1) = (self.x, self.y);
       let (u2,v2) = (toadd.x,toadd.y);
       let delta = &(&(&u1 * &u2) * &(&v1 * &v2)) * &bigjubD;

       Point{
           x: (&u1*&v2 + &v1*&u2) / (&one() + &delta ),
           y: (&v1*&v2 - &(&u1*&u2)*&bigjubA) / (&one() - &delta ),

       }
    }
}

impl<'a,'b> Add <&'b Point> for &'a Point {

    type Output = Point;
    fn add(self, toadd: &'b Point) -> Point{
      let (bigjubA, bigjubD) = (BigInt::from_str_radix(JUBJUB_A,10).unwrap(), BigInt::from_str_radix(JUBJUB_D,10).unwrap());
      if equals(&self.x, &zero()) && equals(&self.y, &zero()) {
           let zero = toadd.clone();
           return zero;
       }
       let (u1,v1) = (&self.x, &self.y);
       let (u2,v2) = (&toadd.x,&toadd.y);
       let delta = &(&( u1 * u2) * &(v1 * v2)) * &bigjubD;
       let res = Point{

           x: ((u1*v2) + (v1*u2)) / (&one() + &delta ),
           y: ((v1*v2) - &(u1*u2)*&bigjubA) / (&one() - &delta ),

       };

       res
    }
}

impl Mul<u32> for Point{
    type Output = Point;
    fn mul(mut self, mut scalar: u32) -> Self {
      //let mut p = &self;
      let mut a = infinity();
      loop {
          if scalar & 1 != 0{
              a = &a + &self;
          }
          self = self.double();
          scalar = scalar / 2;
          if scalar == 0{
              return a;
          }
        }
    }
}

impl <'a > Mul<BigInt> for &'a Point{
    type Output = Point;
    fn mul(self, mut scalar: BigInt) -> Point {
      //let mut p = &self;
      let mut point = self.clone();
      let mut a = infinity();
      let two = BigInt::from(2);
      let one  = BigInt::from(1);
      let zero = BigInt::from(0);
      loop {
          if BigInt::from(&scalar & &one) != zero{
              a = &a + &point
          };

          point = point.double();
          scalar = scalar / &two;
          if scalar == zero {

              return a;
          }
        }
    }
}

impl <'a > Mul<u32> for &'a Point{
    type Output = Point;
    fn mul(self, mut scalar: u32) -> Point {
      //let mut p = &self;
      let mut point = self.clone();
      let mut a = infinity();
      loop {
         if scalar & 1 != 0 {
            a = &a + &point;
         }
          point = point.double();
          scalar = scalar / 2;
          if scalar == 0{
              return a;
          }
        }
    }
}

impl Neg for Point {
    type Output = Point;
    fn neg(self) -> Self {
       Point{x: self.x.neg(), y: self.y}
    }
}

 pub fn infinity()->Point{
     Point{
         x: zero(),
         y: one(),
     }
 }
 pub fn generator() -> Point{
     Point{ x: newFQ(BigInt::from_str_radix(GENERATOR_X, 10).unwrap()),
            y: newFQ(BigInt::from_str_radix(GENERATOR_Y, 10).unwrap())
     }
 }

pub fn from_hash(entropy: &[u8])-> Result<Point,Error>{

    let one = &BigInt::from(1);
    let (bigjubC, bigjubL) = (BigInt::from_str_radix(JUBJUB_C,10).unwrap(), BigInt::from_str_radix(JUBJUB_L,10).unwrap());
    let to_parse_big_int = BigInt::from_signed_bytes_be(Sha256::digest(entropy).as_slice()).to_str_radix(10);
    let to_parse = match BigInt::from_str_radix(&to_parse_big_int,10){
        Ok(t) => t,
        Err(e) => {
            println!("error{}",e);
            return Err(Error::Invalid{});
        }
    };

    let mut y = newFQ(to_parse);
    let mut p;
    let mut x: Point;
    loop {
        p = from_y(&y);
        match p {
            Err(e) => {
                y=&y+one;
            },
            Ok(foundx) => {

                x = foundx;
                break;
            }
        };
    }
    x = &x * bigjubC;

    let is_inf = &(&x * bigjubL);
    if !is_inf.eq(&infinity()){

        return Err(Error::NoPrimeOrder{notinf: is_inf.to_string()});
    }
    Ok(x)

}

pub fn from_y(y: &FQ)-> Result<Point, Error >{
    let (bigjubA, bigjubD) = (BigInt::from_str_radix(JUBJUB_A,10).unwrap(), BigInt::from_str_radix(JUBJUB_D,10).unwrap());
    let p = BigInt::from_str_radix(JUBJUB_Q,10).unwrap();
    let ydouble = y*y;
    let lhs = &ydouble - &BigInt::from(1);
    let rhs = ydouble*bigjubD-bigjubA;
    let xsq = lhs / rhs ;
    let sqr = square_root_mod_prime(xsq.n, p);
    let newx = match sqr {
        Err(e) => return Err(e),
        Ok(newx) => newx,
    };

    let mut x = newFQ(newx);
    if x.n < (-&x).n{
        x = -x;
    }
    Ok(Point{
        x: x,
        y: y.clone()
    })

}

pub fn from_signed_y(y: &FQ, sg: BigInt)-> Result<Point, Error >{
    let (bigjubA, bigjubD) = (BigInt::from_str_radix(JUBJUB_A,10).unwrap(), BigInt::from_str_radix(JUBJUB_D,10).unwrap());
    let p = BigInt::from_str_radix(JUBJUB_Q,10).unwrap();
    let ydouble = y*y;
    let lhs = &ydouble - &BigInt::from(1);
    let rhs = ydouble*bigjubD-bigjubA;
    let xsq = lhs / rhs ;
    let sqr = square_root_mod_prime(xsq.n, p);
    let newx = match sqr {
        Err(e) => return Err(e),
        Ok(newx) => newx,
    };

    let mut x = newFQ(newx);
    if (x.clone().n & BigInt::one()) != sg{
        x = -x;
    }
    Ok(Point{
        x: x,
        y: y.clone()
    })

}
