//! State transition types

use arrayref::{array_mut_ref, array_ref};
use solana_sdk::{
    program_error::ProgramError,
    program_pack::{Pack, Sealed},
};
use crate::state::*;

#[repr(C)]
pub struct LeagueList<'a> {
    pub buf: &'a mut [u8;LeagueList::LEN],
}
impl<'a> LeagueList<'a> {
    pub const ITEM_SIZE: usize = League::LEN;
    pub const ITEM_COUNT: usize = consts::LEAGUES_COUNT;
    pub const LEN: usize = LeagueList::ITEM_SIZE * LeagueList::ITEM_COUNT;

    pub fn get(self, i: usize) -> League<'a> {
        League { buf: array_mut_ref![self.buf, i * LeagueList::ITEM_COUNT, LeagueList::ITEM_SIZE] }
    }

    pub fn copy_to(self, to: Self) {
        to.buf.copy_from_slice(self.buf);
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
