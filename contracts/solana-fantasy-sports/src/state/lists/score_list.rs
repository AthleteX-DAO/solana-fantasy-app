//! State transition types

use crate::error::SfsError;
use crate::state::*;
use arrayref::{array_mut_ref, array_ref};
use solana_program::{
    program_error::ProgramError,
    program_pack::{Pack, Sealed},
};
use std::cell::RefCell;
use std::ops::{Index, IndexMut};

#[repr(C)]
pub struct ScoreList<'a> {
    data: &'a RefCell<&'a mut [u8]>,
    offset: usize,
}
impl<'a> ScoreList<'a> {
    pub const ITEM_SIZE: usize = Score::LEN;
    pub const ITEM_COUNT: u8 = consts::GAMES_COUNT;
    pub const LEN: usize = ScoreList::ITEM_SIZE * ScoreList::ITEM_COUNT as usize;

    pub fn get_by_week(&self, i: u8) -> Result<Score<'a>, ProgramError> {
        if i == 0 || i > ScoreList::ITEM_COUNT {
            return Err(SfsError::IndexOutOfRange.into());
        }
        Score::new(
            self.data,
            self.offset + (i as usize - 1) * ScoreList::ITEM_SIZE,
        )
    }

    pub fn copy_to(&self, to: &Self) {
        let mut dst = to.data.borrow_mut();
        let mut src = self.data.borrow_mut();
        array_mut_ref![dst, to.offset, ScoreList::LEN].copy_from_slice(array_mut_ref![
            src,
            self.offset,
            ScoreList::LEN
        ]);
    }

    pub fn new(data: &'a RefCell<&'a mut [u8]>, offset: usize) -> Result<ScoreList, ProgramError> {
        if data.borrow().len() < Self::LEN + offset {
            return Err(ProgramError::InvalidAccountData);
        }
        Ok(ScoreList { data, offset })
    }
}

// Pull in syscall stubs when building for non-BPF targets
#[cfg(not(target_arch = "bpf"))]
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
