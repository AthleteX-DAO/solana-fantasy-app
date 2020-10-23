//! State transition types

use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};
use solana_sdk::{
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
};
use super::{
    helpers::*
};
use std::{
    cell::{Ref, RefCell, RefMut},
    cmp, fmt,
    rc::Rc,
};

#[repr(C)]
pub struct Score<'a> {
    pub buf: &'a mut [u8;Score::LEN],
}
impl<'a> Score<'a> {
    pub const LEN: usize = 1 + 1;
    fn slice(self) -> (
        &'a mut [u8;1],
        &'a mut [u8;1]) {
        mut_array_refs![
            self.buf,
            1,
            1
        ]
    }

    pub fn get_score1(self) -> u8 { self.slice().0[0] }
    pub fn set_score1(self, value: u8) { self.slice().0[0] = value; }

    pub fn get_is_initialized(self) -> bool { unpack_is_initialized(self.slice().1).unwrap() }
    pub fn set_is_initialized(self, value: bool) { self.slice().1[0] = value as u8; }

    pub fn copy_to(self, to: Self) {
        to.buf.copy_from_slice(self.buf);
    }
}

#[repr(C)]
pub struct Score2<'a> {
    pub buf: &'a RefCell<&'a mut [u8]>,
    pub offset: usize,
}
impl<'a> Score2<'a> {
    pub const LEN: usize = 1 + 1;
    fn slice<'b>(&self, data: &'b mut [u8]) -> (
        &'b mut [u8;1],
        &'b mut [u8;1]) {
        mut_array_refs![
            array_mut_ref![data, self.offset, Score2::LEN],
            1,
            1
        ]
    }

    pub fn get_score1(&self) -> u8 {
        self.slice(&mut self.buf.borrow_mut()).0[0]
    }
    pub fn set_score1(&self, value: u8) {
        self.slice(&mut self.buf.borrow_mut()).0[0] = value;
    }

    pub fn get_is_initialized(&self) -> bool {
        unpack_is_initialized(self.slice(&mut self.buf.borrow_mut()).1).unwrap()
    }
    pub fn set_is_initialized(&self, value: bool) {
        self.slice(&mut self.buf.borrow_mut()).1[0] = value as u8;
    }

    pub fn copy_to(self, to: Self) {
        to.buf.borrow_mut().copy_from_slice(&self.buf.borrow_mut());
    }
}

// Pull in syscall stubs when building for non-BPF targets
#[cfg(not(target_arch = "bpf"))]
solana_sdk::program_stubs!();

#[cfg(test)]
mod tests {
    use super::*;

    // #[test]
    // fn test_pack_unpack() {
    //     let check = Score {
    //         score1: 4,
    //         is_initialized: true,
    //     };
    //     let mut packed = vec![0; Score::get_packed_len() + 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         Score::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; Score::get_packed_len() - 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         Score::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; Score::get_packed_len()];
    //     Score::pack(check.clone(), &mut packed).unwrap();
    //     let mut expect = vec![4u8; 1];
    //     expect.extend_from_slice(&[1u8]);
    //     assert_eq!(packed, expect);
    //     let unpacked = Score::unpack_unchecked(&packed).unwrap();
    //     assert_eq!(unpacked, check);

    //     let size = Score::get_packed_len();
    //     assert!(size < 100, "too large size, {} bytes", size);
    //     let size = std::mem::size_of::<Score>();
    //     assert!(size < 100, "too large size, {} bytes", size);
    // }
}
