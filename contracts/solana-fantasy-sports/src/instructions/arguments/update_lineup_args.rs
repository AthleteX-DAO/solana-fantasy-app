//! State transition types

use crate::instructions::*;
use crate::state::consts::*;
use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};
use byteorder::{ByteOrder, LittleEndian};
use solana_program::pubkey::Pubkey;
use solana_program::{
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
};
use std::cell::RefCell;

#[repr(C)]
pub struct UpdateLineupArgs<'a> {
    data: &'a RefCell<&'a [u8]>,
    offset: usize,
}
impl<'a> UpdateLineupArgs<'a> {
    pub const LEN: usize = ActivePlayersList::LEN + 2 + 1 + 1;
    fn slice<'b>(
        &self,
        data: &'b [u8],
    ) -> (
        &'b [u8; ActivePlayersList::LEN],
        &'b [u8; 2],
        &'b [u8; 1],
        &'b [u8; 1],
    ) {
        array_refs![
            array_ref![data, self.offset, UpdateLineupArgs::LEN],
            ActivePlayersList::LEN,
            2,
            1,
            1
        ]
    }

    pub fn get_active_players(&self) -> Result<ActivePlayersList<'a>, ProgramError> {
        ActivePlayersList::new(self.data, self.offset)
    }

    pub fn get_league_index(&self) -> u16 {
        LittleEndian::read_u16(self.slice(&mut self.data.borrow()).1)
    }

    pub fn get_user_id(&self) -> u8 {
        self.slice(&mut self.data.borrow()).2[0]
    }

    pub fn get_week(&self) -> u8 {
        self.slice(&mut self.data.borrow()).3[0]
    }

    pub fn copy_to(&self, to: &mut [u8]) {
        let src = self.data.borrow();
        array_mut_ref![to, self.offset, UpdateLineupArgs::LEN].copy_from_slice(array_ref![
            src,
            self.offset,
            UpdateLineupArgs::LEN
        ]);
    }

    pub fn new(
        data: &'a RefCell<&'a [u8]>,
        offset: usize,
    ) -> Result<UpdateLineupArgs, ProgramError> {
        if data.borrow().len() < Self::LEN + offset {
            return Err(ProgramError::InvalidInstructionData);
        }
        Ok(UpdateLineupArgs { data, offset })
    }
}
impl Clone for UpdateLineupArgs<'_> {
    fn clone(&self) -> Self {
        Self {
            data: self.data,
            offset: self.offset,
        }
    }
}

// Pull in syscall stubs when building for non-BPF targets
#[cfg(not(target_arch = "bpf"))]

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
