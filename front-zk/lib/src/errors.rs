//extern crate rug;
extern crate snafu;
extern crate num_bigint;
use self::snafu::Snafu;
use self::num_bigint::{BigInt};
//use self::rug::BigInt;
#[derive(Debug,Snafu)]
pub enum Error {
    #[snafu(display("Negative values are not allowed for exponent: {} or modulus: {}", exponent, modulus ))]
    NoNegative{exponent:  BigInt, modulus: BigInt},

    #[snafu(display("modulus n: {} has to be greater than 3: ", n ))]
    GtThree{n: BigInt},

    #[snafu(display("number num: {} has to be odd: ", num ))]
    NotOdd{num:  BigInt},

    #[snafu(display("number x: {} has to be one: ", x ))]
    NotOne{x:  BigInt},

    #[snafu(display("vector is void "))]
    Void{},

    #[snafu(display("exponent {} is greater than the mod prime {}",exponent,p))]
    Exponent{exponent: BigInt, p: BigInt},

    #[snafu(display("value {} is invalid ",a))]
    ValueErr{a: BigInt},

    #[snafu(display("prime p {} is invalid ",p))]
    InvalidPrime{p: BigInt},

    #[snafu(display(" invalid jacobi value "))]
    Jacobi{},

    #[snafu(display(" You should not be here"))]
    Invalid{},

    #[snafu(display(" number excedes 65535 "))]
    LargeNumber{},

    #[snafu(display(" Point: {} is not infinite ", notinf))]
    NoPrimeOrder{notinf: String},

    #[snafu(display(" The hasher is not initialized "))]
    NotInit{},

    #[snafu(display(" size error, the size is {}",s))]
    SizeErr{s: usize}

}
