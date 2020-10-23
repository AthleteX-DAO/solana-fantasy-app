//! State transition types

use arrayref::{array_mut_ref, array_ref};
use solana_sdk::{
    program_error::ProgramError,
    program_pack::{Pack, Sealed},
};
use crate::state::*;

#[repr(C)]
pub struct UserStateList<'a> {
    pub buf: &'a mut [u8;UserStateList::LEN],
}
impl<'a> UserStateList<'a> {
    pub const ITEM_SIZE: usize = UserState::LEN;
    pub const ITEM_COUNT: usize = consts::LEAGUE_USERS_COUNT;
    pub const LEN: usize = UserStateList::ITEM_SIZE * UserStateList::ITEM_COUNT;

    pub fn get(self, i: usize) -> UserState<'a> {
        UserState { buf: array_mut_ref![self.buf, i * UserStateList::ITEM_COUNT, UserStateList::ITEM_SIZE] }
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
    //     let check = UserStateList {
    //         list: [UserState::default(); ITEM_COUNT],
    //     };
    //     let mut packed = vec![0; UserStateList::get_packed_len() + 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         UserStateList::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; UserStateList::get_packed_len() - 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         UserStateList::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; UserStateList::get_packed_len()];
    //     UserStateList::pack(check.clone(), &mut packed).unwrap();
    //     let expect = vec![0u8; ITEM_SIZE * ITEM_COUNT];
    //     assert_eq!(packed, expect);
    //     let unpacked = UserStateList::unpack_unchecked(&packed).unwrap();
    //     assert_eq!(unpacked, check);

    //     let size = UserStateList::get_packed_len();
    //     assert!(size < 100, "too large size, {} bytes", size);
    //     let size = std::mem::size_of::<UserStateList>();
    //     assert!(size < 100, "too large size, {} bytes", size);
    // }
}
