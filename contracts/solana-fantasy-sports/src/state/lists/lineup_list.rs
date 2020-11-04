//! State transition types

use crate::error::SfsError;
use crate::state::*;
use arrayref::{array_mut_ref, array_ref};
use solana_program::{
    program_error::ProgramError,
    program_pack::{Pack, Sealed},
};
use std::cell::RefCell;

#[repr(C)]
pub struct LineupList<'a> {
    data: &'a RefCell<&'a mut [u8]>,
    offset: usize,
}
impl<'a> LineupList<'a> {
    pub const ITEM_SIZE: usize = lists::ActivePlayersList::LEN;
    pub const ITEM_COUNT: u8 = consts::GAMES_COUNT;
    pub const LEN: usize = LineupList::ITEM_SIZE * LineupList::ITEM_COUNT as usize;

    pub fn get_by_week(&self, i: u8) -> Result<ActivePlayersList<'a>, ProgramError> {
        if i == 0 || i > LineupList::ITEM_COUNT {
            return Err(SfsError::IndexOutOfRange.into());
        }
        ActivePlayersList::new(
            self.data,
            self.offset + (i as usize - 1) * LineupList::ITEM_SIZE,
        )
    }

    pub fn copy_to(&self, to: &Self) {
        let mut dst = to.data.borrow_mut();
        let mut src = self.data.borrow_mut();
        array_mut_ref![dst, to.offset, LineupList::LEN].copy_from_slice(array_mut_ref![
            src,
            self.offset,
            LineupList::LEN
        ]);
    }

    pub fn new(data: &'a RefCell<&'a mut [u8]>, offset: usize) -> Result<LineupList, ProgramError> {
        if data.borrow().len() < Self::LEN + offset {
            return Err(ProgramError::InvalidAccountData);
        }
        Ok(LineupList { data, offset })
    }
}

// Pull in syscall stubs when building for non-BPF targets
#[cfg(not(target_arch = "bpf"))]
#[cfg(test)]
mod tests {
    use super::*;

    // #[test]
    // fn test_pack_unpack() {
    //     let check = LineupList {
    //         list: [ActivePlayersList::default(); ITEM_COUNT],
    //     };
    //     let mut packed = vec![0; LineupList::get_packed_len() + 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         LineupList::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; LineupList::get_packed_len() - 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         LineupList::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; LineupList::get_packed_len()];
    //     LineupList::pack(check.clone(), &mut packed).unwrap();
    //     let expect = vec![0u8; ITEM_SIZE * ITEM_COUNT];
    //     assert_eq!(packed, expect);
    //     let unpacked = LineupList::unpack_unchecked(&packed).unwrap();
    //     assert_eq!(unpacked, check);

    //     let size = LineupList::get_packed_len();
    //     assert!(size < 100, "too large size, {} bytes", size);
    //     let size = std::mem::size_of::<LineupList>();
    //     assert!(size < 100, "too large size, {} bytes", size);
    // }
}
