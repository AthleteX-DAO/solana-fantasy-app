//! State transition types

use crate::instructions::*;
use crate::state::consts::*;
use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};
use byteorder::{ByteOrder, LittleEndian};
use solana_sdk::pubkey::Pubkey;
use solana_sdk::{
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
};
use std::cell::RefCell;

#[repr(C)]
pub struct ProposeSwapArgs<'a> {
    pub data: &'a RefCell<&'a [u8]>,
    pub offset: usize,
}
impl<'a> ProposeSwapArgs<'a> {
    pub const LEN: usize = 2 + 2 + 2;
    fn slice<'b>(&self, data: &'b [u8]) -> (&'b [u8; 2], &'b [u8; 2], &'b [u8; 2]) {
        array_refs![array_ref![data, self.offset, ProposeSwapArgs::LEN], 2, 2, 2]
    }

    pub fn get_league(&self) -> u16 {
        LittleEndian::read_u16(self.slice(&mut self.data.borrow()).0)
    }

    pub fn get_give_player_id(&self) -> u16 {
        LittleEndian::read_u16(self.slice(&mut self.data.borrow()).1)
    }

    pub fn get_want_player_id(&self) -> u16 {
        LittleEndian::read_u16(self.slice(&mut self.data.borrow()).2)
    }

    pub fn copy_to(&self, to: &mut [u8]) {
        let src = self.data.borrow();
        array_mut_ref![to, self.offset, ProposeSwapArgs::LEN].copy_from_slice(array_ref![
            src,
            self.offset,
            ProposeSwapArgs::LEN
        ]);
    }
}
impl Clone for ProposeSwapArgs<'_> {
    fn clone(&self) -> Self {
        Self {
            data: self.data,
            offset: self.offset,
        }
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
