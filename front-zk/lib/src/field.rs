extern crate num_bigint;
//extern crate rug;
extern crate core;
extern crate num_traits;
extern crate num_integer;

use std::ops::{Add, Mul, Neg,Div,Sub};
use self::num_bigint::{BigInt,ToBigInt};
use self::num_traits::{Num,Zero};
use self::num_integer::Integer;
//use self::rug::{BigInt, ops::RemRounding, Assign};
//use num_BigInt::mod_floor;
use self::core::mem;
pub const FIELD_MODULUS: &str = "21888242871839275222246405745257275088548364400416034343698204186575808495617";

#[derive(Clone,Debug)]
pub struct FQ {
    pub n: BigInt,
}


impl Add for FQ{
    type Output = FQ;
     fn add(self, val: FQ) -> Self {
        newFQ((&self.n + val.n))
    }
}

impl Add<BigInt> for FQ{
    type Output = FQ;
     fn add(self, val: BigInt) -> Self {
        newFQ((&self.n + val))
    }
}

impl Sub for FQ{
    type Output = FQ;
     fn sub(self, val: FQ) -> Self {
        newFQ((&self.n - val.n))
    }
}

impl Sub<BigInt> for FQ{
    type Output = FQ;
     fn sub(self, val: BigInt) -> Self {
        newFQ((&self.n - val))
    }
}

impl Mul for FQ{
     type Output = FQ;
     fn mul(self, val: FQ) -> Self {

        newFQ((&self.n * val.n))
    }
}

impl Mul<BigInt> for FQ{
     type Output = FQ;
     fn mul(self, val: BigInt) -> Self {

        newFQ((&self.n * val))
    }
}

impl Div for FQ{
    type Output = FQ;
    fn div(self, val: FQ) -> Self{
        let inve = inv(val.n, BigInt::from_str_radix(FIELD_MODULUS,10).unwrap());
        newFQ(&self.n * inve )
    }
}

impl Div<BigInt> for FQ{
    type Output = FQ;
    fn div(self, val: BigInt) -> Self{
        newFQ(&self.n * inv(val, BigInt::from_str_radix(FIELD_MODULUS,10).unwrap()))
    }
}

impl Neg for FQ{
    type Output = FQ;
    fn neg(self) -> Self {
        newFQ(-self.n)
    }

}

//////////////////////////////////


impl<'a, 'b> Add<&'b FQ> for &'a FQ{
    type Output =  FQ;
     fn add(self, val: &'b FQ) ->  FQ {
        newFQ(self.clone().n + &val.n)
    }
}

impl<'a, 'b> Add<&'b BigInt> for &'a FQ{
    type Output =  FQ;
     fn add(self, val: &'b BigInt) ->  FQ {
        newFQ(self.clone().n + val)
    }
}

impl <'a, 'b> Sub<&'b FQ> for &'a FQ{
    type Output =  FQ;
     fn sub(self, val: &'b FQ) ->  FQ {
        newFQ(self.clone().n - &val.n)
    }
}

impl<'a, 'b> Sub<&'b BigInt> for &'a FQ{
    type Output = FQ;
     fn sub(self, val: &'b BigInt) -> FQ {
        newFQ(self.clone().n - val)
    }
}

impl<'a, 'b> Mul<&'b FQ> for &'a FQ{
     type Output = FQ;
     fn mul(self, val: &'b FQ) -> FQ {

        newFQ(self.clone().n * &val.n)
    }
}

impl <'a, 'b> Mul<&'b BigInt> for &'a FQ{
     type Output =  FQ;
     fn mul(self, val: &'b BigInt) ->  FQ {

        newFQ(self.clone().n * val)
    }
}

impl <'a, 'b> Div <&'b FQ>for &'a FQ{
    type Output = FQ;
    fn div(self, val: &'b FQ) ->  FQ{
        newFQ(&self.n * inv_ref(&val.n, BigInt::from_str_radix(FIELD_MODULUS,10).unwrap()))
    }
}

impl <'a, 'b> Div<&'b BigInt> for &'a FQ{
    type Output = FQ;
    fn div(self, val: &'b BigInt) ->  FQ {
        newFQ(&self.n * inv_ref(val, BigInt::from_str_radix(FIELD_MODULUS,10).unwrap()))
    }
}

impl <'a> Neg for &'a FQ{
    type Output = FQ;
    fn neg(self) -> FQ {
        newFQ(-self.clone().n)

    }

}

/////////////////////////////////////////



pub fn inv(a: BigInt, n: BigInt)-> BigInt {
    let zero = BigInt::from(0);
    let one = BigInt::from(1);
    if a == zero {
        return a;
    }
    let (mut lm,mut hm) = (number(1),number(0));
    let (mut new, mut nm) = (number(0), number(1));
    let (mut low,mut high) = ((a.clone().mod_floor(&n)), n.clone());
    let mut buffer = BigInt::zero();
    loop {

        if low <= one {
            break lm.mod_floor(&n);
        }
        let (r,_) = high.clone().div_mod_floor(&low.clone()) ;
        buffer = (&high - &low *&r);
        mem::swap(&mut buffer, &mut new);
        mem::swap(&mut high, &mut low);
        buffer = (&hm - &lm * &r);
        mem::swap(&mut buffer, &mut nm);
        mem::swap(&mut hm, &mut lm);
        mem::swap(&mut low, &mut new );
        mem::swap(&mut lm, &mut nm);
    }
}

pub fn inv_ref(a: &BigInt, n: BigInt)-> BigInt {
    let zero = BigInt::from(0);
    let one = BigInt::from(1);
    if a == &zero {
        return a.clone();
    }
    let (mut lm,mut hm) = (number(1),number(0));
    let (mut low,mut high) = (a.mod_floor(&n), n.clone());
    let mut new: BigInt;
    let mut nm: BigInt;
    loop {
        let r = &(high.clone() / low.clone());
        nm = hm - lm.clone() * r;
        new =  high - low.clone() * r;
        high = low;
        hm = lm;
        low = new;
        lm = nm;
        if (low <= one) {
            break lm.mod_floor(&n)

        }


    }
}


fn number(k: usize)->BigInt{
    BigInt::from(k)
}

pub fn one() -> FQ{
    newFQ(BigInt::from(1))
}

pub fn zero() -> FQ{
    newFQ(BigInt::from(0))
}

pub fn equals(fq1: &FQ , fq2: &FQ) -> bool {
     fq1.n == fq2.n
}

pub fn newFQ(x: BigInt)-> FQ{
    let newx = x.mod_floor(&BigInt::from_str_radix(&FIELD_MODULUS, 10).unwrap());
    FQ{n: newx}
}
