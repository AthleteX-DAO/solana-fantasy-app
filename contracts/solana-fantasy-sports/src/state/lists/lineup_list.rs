//! State transition types

use arrayref::{array_mut_ref, array_ref};
use solana_sdk::{
    program_error::ProgramError,
    program_pack::{Pack, Sealed},
};
use crate::state::*;
use crate::state::lists::ActivePlayersList;

#[repr(C)]
pub struct LineupList<'a> {
    pub buf: &'a mut [u8;LineupList::LEN],
}
impl<'a> LineupList<'a> {
    pub const ITEM_SIZE: usize = lists::ActivePlayersList::LEN;
    pub const ITEM_COUNT: usize = consts::GAMES_COUNT;
    pub const LEN: usize = LineupList::ITEM_SIZE * LineupList::ITEM_COUNT;

    pub fn get(self, i: usize) -> ActivePlayersList<'a> {
        ActivePlayersList { buf: array_mut_ref![self.buf, i * LineupList::ITEM_COUNT, LineupList::ITEM_SIZE] }
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
