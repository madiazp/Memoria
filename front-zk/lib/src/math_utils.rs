//extern crate rug;
extern crate num_iter;
extern crate core;
extern crate num_bigint;
extern crate num_integer;

use self::num_bigint::{BigInt};
//use self::rug::{BigInt, ops::RemRounding, ops::Pow, Assign};
use self::num_iter::range_inclusive;
use crate::errors::{Error};
use self::core::convert::From;
//use num_traits::cast::FromPrimitive;
use self::num_integer::Integer;

pub fn mod_exp(base: BigInt, exponent: &BigInt, modulus: &BigInt)->Result<BigInt,Error>{
    if exponent < &number(0) || modulus < &number(0) {
        Err(Error::NoNegative{exponent: exponent.clone(), modulus: modulus.clone()})
    } else {
        Ok(base.modpow(&exponent, &modulus))
    }

}

pub fn polynomial_reduce_mod(poly: &Vec<BigInt>, polymod: &Vec<BigInt>, p: &BigInt) -> Result<Vec<BigInt>, Error>{
    let mut newpoly = poly.clone();
    let one = number(1);
    let zero = number(0);
    if polymod.len() <= 1{
        return Err(Error::Void{})
    }
    match polymod.last() {
        Some(x) => {
            if x != &one {
                return Err(Error::NotOne{x: x.clone()})
            }
        },
        None => return Err(Error::Void{}),
    };
    let mut poly_l: usize;
    while newpoly.len() >= polymod.len(){
        if newpoly.last().unwrap() != &zero{
            for i in 2..polymod.len()+1{
                poly_l = newpoly.len();
                //println!("polies {}, poly i {}, polymod {}", newpoly[poly_l-i],newpoly.last().unwrap(), polymod[polymod.len()-i] );
                newpoly[poly_l-i] = BigInt::from(&newpoly[poly_l-i]-newpoly.last().unwrap()*&polymod[polymod.len()-i]).mod_floor(p);

            }
        }
        newpoly = newpoly[..newpoly.len()-1].to_vec();
    }
    Ok(newpoly)

}

pub fn polynomial_multiply_mod(m1: &Vec<BigInt>, m2: &Vec<BigInt>, polymod: &Vec<BigInt>, p: &BigInt)-> Result<Vec<BigInt>, Error>{
    let size = m1.len()+m2.len()-1;
    let zero = number(0);
    let mut prod = vec![zero;size];
    for i in 0..m1.len(){
        for j in 0..m2.len(){
            prod[i+j] = BigInt::from(&prod[i+j]+&m1[i]*&m2[j]).mod_floor(&p);
        }
    }

    polynomial_reduce_mod(&prod, &polymod, &p)
}

pub fn polynomial_exp_mod(base: Vec<BigInt>, exponent: BigInt, polymod: Vec<BigInt>, p: BigInt ) -> Result<Vec<BigInt>,Error>{
    let two = number(2);
    let one = number(1);
    let zero = number(0);
    if exponent >= p {
        return Err(Error::Exponent{exponent: exponent.clone(), p: p.clone()})
    } else if exponent == zero {
        return Ok(vec!(one.clone();1))
    }

    let mut g: Vec<BigInt> = base;
    let mut k = exponent;
    let mut s: Vec<BigInt>;
    if k.is_odd() {
         s = g.clone();
    } else {
         s = vec!(number(1);1);

    }

    loop {
        k /= &two;
        g = polynomial_multiply_mod(&g, &g, &polymod, &p)?;
        if k.is_odd() {
            s = polynomial_multiply_mod(&g, &s, &polymod, &p)?;
        }
        if k <= one {
            break Ok(s);
        }
    }
}

pub fn square_root_mod_prime(a: BigInt, p: BigInt) -> Result<BigInt,Error> {
    let negone = BigInt::from(-1);
    let zero = number(0);
    let one = number(1);
    let two = number(2);
    let three = number(3);
    let four = number(4);
    let five = number(5);
    let eight = number(8);
    if a < zero || a >= p {
        Err(Error::ValueErr{a: a.clone()})
    } else if p <= one {
        Err(Error::InvalidPrime{p: p.clone()})
    } else if a == zero {
        Ok(zero.clone())
    } else if p == two {
        Ok(a.clone())
    } else {
        let jac = jacobi(&a,&p).unwrap();
        if jac == -number(1){
            Err(Error::Jacobi{})
        } else if p.clone().mod_floor(&four) == three {
            Ok(mod_exp(a, &((&p-number(1))/number(4)), &p).unwrap())
        } else if p.clone().mod_floor(&eight) == five {
            let d = mod_exp(a.clone(), &((&p-number(1))/number(4)), &p).unwrap();

            if d == one {
                Ok(mod_exp(a, &((&p + three)/eight), &p).unwrap())
            } else if d == &p - number(1) {
                let modi = &mod_exp(four * &a, &((&p - five)/8),&p).unwrap();
                Ok((two * a * modi).mod_floor(&p))
            } else{
                Err({Error::Invalid{}})
            }

        } else {
            let mut b = BigInt::from(2);
            while b <= p {

                if jacobi(&(&b*&b-number(4)*&a),&p).unwrap() == negone {
                    let f = vec![a,-b,number(1)];
                    let ff = polynomial_exp_mod(vec![number(0),number(1)], (&p+number(1))/number(2), f, p).unwrap();

                    if ff.len() > 2 {

                        return Err(Error::ValueErr{a: ff[1].clone()})
                    }

                    return Ok(ff[0].clone())
                }
                b += BigInt::from(1);
            }
            Err({Error::Invalid{}})
        }
    }
}

fn number(k: usize)->BigInt{
    BigInt::from(k)
}

pub fn jacobi(nnum: &BigInt,n: &BigInt)-> Result<BigInt,Error>{
    let zero = number(0);
    let one = number(1);
    let two = &number(2);


    if n < &number(3)  {
        return Err(Error::GtThree{n: n.clone()})
    }
    if n.mod_floor(&two) != one {
        return Err(Error::NotOdd{num: nnum.clone()})
    }

    let mut acc = one;
    let mut num = nnum.mod_floor(&n); //.to_usize().unwrap();
    let mut den = n.clone();
    loop {
        // reduce numerator
        num = num.mod_floor(&den);
        if num == zero {
            return Ok(zero);
        }

        // extract factors of two from numerator
        while num.is_even() {
            acc = acc * two_over(&den);
            num = num / two;
        }
        // if numerator is 1 => this sub-symbol is 1
        if num == number(1) {
            return Ok(acc.clone());
        }
        // shared factors => one sub-symbol is zero
        if num.gcd(&den) > number(1) {
            return Ok(zero);
        }
        // num and den are now odd co-prime, use reciprocity law:
        acc = acc * reciprocity(&num, &den);
        let tmp = num;
        num = den;
        den = tmp;
    }
}

fn two_over(n: &BigInt) -> BigInt {
    let eight = number(8);
    let one = number(1);
    if n.mod_floor(&eight) == number(1) || n.mod_floor(&eight) == number(7) { one } else { -one }
}

fn reciprocity(num: &BigInt, den: &BigInt) -> BigInt {
    let four = number(4);
    let three = number(3);
    let one = number(1);
    if num.mod_floor(&four) == three && den.mod_floor(&four) == three { -one } else { one }
}
