//! State transition types

use crate::instructions::*;
use crate::state::consts::*;
use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};
use solana_program::pubkey::Pubkey;
use solana_program::{
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
};
use std::cell::RefCell;

#[repr(C)]
pub struct AddPlayersArgs<'a> {
    data: &'a RefCell<&'a [u8]>,
    offset: usize,
}
impl<'a> AddPlayersArgs<'a> {
    pub const LEN: usize = PlayerList::LEN;

    pub fn get_players(&self) -> Result<PlayerList<'a>, ProgramError> {
        PlayerList::new(self.data, self.offset)
    }

    pub fn copy_to(&self, to: &mut [u8]) {
        let src = self.data.borrow();
        array_mut_ref![to, self.offset, AddPlayersArgs::LEN].copy_from_slice(array_ref![
            src,
            self.offset,
            AddPlayersArgs::LEN
        ]);
    }

    pub fn new(data: &'a RefCell<&'a [u8]>, offset: usize) -> Result<AddPlayersArgs, ProgramError> {
        if data.borrow().len() < Self::LEN + offset {
            return Err(ProgramError::InvalidInstructionData);
        }
        Ok(AddPlayersArgs { data, offset })
    }
}
impl Clone for AddPlayersArgs<'_> {
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
