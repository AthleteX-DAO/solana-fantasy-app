//! State transition types

use arrayref::{array_mut_ref, array_ref};
use solana_sdk::{
    program_error::ProgramError,
    program_pack::{Pack, Sealed},
};
use crate::state::*;

#[repr(C)]
pub struct PlayerList<'a> {
    pub buf: &'a mut [u8],
}
impl<'a> PlayerList<'a> {
    pub const ITEM_SIZE: usize = Player::LEN;
    pub const ITEM_COUNT: usize = consts::TOTAL_PLAYERS_COUNT;
    pub const LEN: usize = PlayerList::ITEM_SIZE * PlayerList::ITEM_COUNT;

    // pub fn get(self, i: usize) -> Player<'a> {
    //     Player { buf: array_mut_ref![self.buf, i * PlayerList::ITEM_COUNT, PlayerList::ITEM_SIZE] }
    // }

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
    //     let check = PlayerList {
    //         list: [Player::default(); ITEM_COUNT],
    //     };
    //     let mut packed = vec![0; PlayerList::get_packed_len() + 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         PlayerList::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; PlayerList::get_packed_len() - 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         PlayerList::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; PlayerList::get_packed_len()];
    //     PlayerList::pack(check.clone(), &mut packed).unwrap();
    //     let expect = vec![0u8; ITEM_SIZE * ITEM_COUNT];
    //     assert_eq!(packed, expect);
    //     let unpacked = PlayerList::unpack_unchecked(&packed).unwrap();
    //     assert_eq!(unpacked, check);

    //     let size = PlayerList::get_packed_len();
    //     assert!(size < 100, "too large size, {} bytes", size);
    //     let size = std::mem::size_of::<PlayerList>();
    //     assert!(size < 100, "too large size, {} bytes", size);
    // }
}
