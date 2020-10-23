//! State transition types

use byteorder::{ByteOrder, LittleEndian};
use arrayref::{array_mut_ref, array_ref};
use solana_sdk::{
    program_error::ProgramError,
    program_pack::{Pack, Sealed},
};
use crate::state::*;

const ITEM_SIZE: usize = 2;
const ITEM_COUNT: usize = consts::ACTIVE_PLAYERS_COUNT;

#[repr(C)]
pub struct ActivePlayersList<'a> {
    pub buf: &'a mut [u8;ActivePlayersList::LEN],
}
impl<'a> ActivePlayersList<'a> {
    pub const ITEM_SIZE: usize = 2;
    pub const ITEM_COUNT: usize = consts::ACTIVE_PLAYERS_COUNT;
    pub const LEN: usize = ActivePlayersList::ITEM_SIZE * ActivePlayersList::ITEM_COUNT;

    pub fn get(self, i: usize) -> u16 {
        LittleEndian::read_u16(array_mut_ref![self.buf, i * ActivePlayersList::ITEM_COUNT, ActivePlayersList::ITEM_SIZE])
    }
    pub fn set(self, i: usize, value: u16) {
        LittleEndian::write_u16(array_mut_ref![self.buf, i * ActivePlayersList::ITEM_COUNT, ActivePlayersList::ITEM_SIZE], value);
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
    //     let check = ActivePlayersList {
    //         list: [0u16; ITEM_COUNT],
    //     };
    //     let mut packed = vec![0; ActivePlayersList::get_packed_len() + 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         ActivePlayersList::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; ActivePlayersList::get_packed_len() - 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         ActivePlayersList::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; ActivePlayersList::get_packed_len()];
    //     ActivePlayersList::pack(check.clone(), &mut packed).unwrap();
    //     let expect = vec![0u8; ITEM_SIZE * ITEM_COUNT];
    //     assert_eq!(packed, expect);
    //     let unpacked = ActivePlayersList::unpack_unchecked(&packed).unwrap();
    //     assert_eq!(unpacked, check.clone());

    //     let size = ActivePlayersList::get_packed_len();
    //     assert!(size < 100, "too large size, {} bytes", size);
    //     let size = std::mem::size_of::<ActivePlayersList>();
    //     assert!(size < 100, "too large size, {} bytes", size);
    // }
}
