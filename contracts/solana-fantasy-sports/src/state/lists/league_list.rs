//! State transition types

use crate::state::*;
use arrayref::{array_mut_ref, array_ref};
use solana_sdk::{
    program_error::ProgramError,
    program_pack::{Pack, Sealed},
};
use std::cell::RefCell;

#[repr(C)]
pub struct LeagueList<'a> {
    pub data: &'a RefCell<&'a mut [u8]>,
    pub offset: usize,
}
impl<'a> LeagueList<'a> {
    pub const ITEM_SIZE: usize = League::LEN;
    pub const ITEM_CAPACITY: u16 = consts::LEAGUES_CAPACITY;
    pub const LEN: usize = 2 + LeagueList::ITEM_SIZE * LeagueList::ITEM_CAPACITY as usize;

    pub fn get(&self, i: u16) -> League<'a> {
        League {
            data: self.data,
            offset: self.offset + i as usize * LeagueList::ITEM_SIZE,
        }
    }

    pub fn copy_to(&self, to: &Self) {
        let mut dst = to.data.borrow_mut();
        let mut src = self.data.borrow_mut();
        array_mut_ref![dst, self.offset, LeagueList::LEN].copy_from_slice(array_mut_ref![
            src,
            self.offset,
            LeagueList::LEN
        ]);
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
    //     let check = LeagueList {
    //         list: [League::default(); ITEM_COUNT],
    //     };
    //     let mut packed = vec![0; LeagueList::get_packed_len() + 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         LeagueList::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; LeagueList::get_packed_len() - 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         LeagueList::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; LeagueList::get_packed_len()];
    //     LeagueList::pack(check.clone(), &mut packed).unwrap();
    //     let expect = vec![0u8; ITEM_SIZE * ITEM_COUNT];
    //     assert_eq!(packed, expect);
    //     let unpacked = LeagueList::unpack_unchecked(&packed).unwrap();
    //     assert_eq!(unpacked, check);

    //     let size = LeagueList::get_packed_len();
    //     assert!(size < 100, "too large size, {} bytes", size);
    //     let size = std::mem::size_of::<LeagueList>();
    //     assert!(size < 100, "too large size, {} bytes", size);
    // }
}
