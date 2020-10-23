//! State transition types

use std::ops::{Index, IndexMut};
use arrayref::{array_mut_ref, array_ref};
use solana_sdk::{
    program_error::ProgramError,
    program_pack::{Pack, Sealed},
};
use crate::state::*;
use std::{
    cell::{Ref, RefCell, RefMut},
    cmp, fmt,
    rc::Rc,
};

#[repr(C)]
pub struct ScoreList<'a> {
    pub buf: &'a RefCell<&'a mut [u8]>,
    pub offset: usize,
}
impl<'a> ScoreList<'a> {
    pub const ITEM_SIZE: usize = Score2::LEN;
    pub const ITEM_COUNT: usize = consts::GAMES_COUNT;
    pub const LEN: usize = ScoreList::ITEM_SIZE * ScoreList::ITEM_COUNT;

    pub fn get(&self, i: usize) -> Score2<'a> {
        Score2 { buf: self.buf, offset: self.offset + i * ScoreList::ITEM_SIZE }
    }

    // pub fn copy_to(self, to: Self) {
    //     to.buf.copy_from_slice(self.buf);
    // }
}

// Pull in syscall stubs when building for non-BPF targets
#[cfg(not(target_arch = "bpf"))]
solana_sdk::program_stubs!();

#[cfg(test)]
mod tests {
    use super::*;

    // #[test]
    // fn test_pack_unpack() {
    //     let check = ScoreList {
    //         list: [Score::default(); ITEM_COUNT],
    //     };
    //     let mut packed = vec![0; ScoreList::get_packed_len() + 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         ScoreList::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; ScoreList::get_packed_len() - 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         ScoreList::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; ScoreList::get_packed_len()];
    //     ScoreList::pack(check.clone(), &mut packed).unwrap();
    //     let expect = vec![0u8; ITEM_SIZE * ITEM_COUNT];
    //     assert_eq!(packed, expect);
    //     let unpacked = ScoreList::unpack_unchecked(&packed).unwrap();
    //     assert_eq!(unpacked, check);

    //     let size = ScoreList::get_packed_len();
    //     assert!(size < 100, "too large size, {} bytes", size);
    //     let size = std::mem::size_of::<ScoreList>();
    //     assert!(size < 100, "too large size, {} bytes", size);
    // }
}
