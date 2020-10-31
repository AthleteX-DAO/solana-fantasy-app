//! State transition types

use crate::error::SfsError;
use crate::instructions::*;
use crate::state::consts::*;
use arrayref::{array_mut_ref, array_ref, array_refs};
use byteorder::{ByteOrder, LittleEndian};
use solana_program::{
    program_error::ProgramError,
    program_pack::{Pack, Sealed},
};
use std::cell::RefCell;

#[repr(C)]
pub struct PlayerList<'a> {
    data: &'a RefCell<&'a [u8]>,
    offset: usize,
}
impl<'a> PlayerList<'a> {
    pub const ITEM_SIZE: usize = Player::LEN;
    pub const ITEM_CAPACITY: u16 = MAX_PLAYERS_PER_INSTRUCTION;
    pub const LEN: usize = 1 + PlayerList::ITEM_SIZE * PlayerList::ITEM_CAPACITY as usize;
    fn slice<'b>(
        &self,
        data: &'b [u8],
    ) -> (
        &'b [u8; 1],
        &'b [u8; PlayerList::ITEM_SIZE * PlayerList::ITEM_CAPACITY as usize],
    ) {
        array_refs![
            array_ref![data, self.offset, PlayerList::LEN],
            1,
            PlayerList::ITEM_SIZE * PlayerList::ITEM_CAPACITY as usize
        ]
    }

    pub fn get_count(&self) -> u8 {
        self.slice(&self.data.borrow()).0[0]
    }

    pub fn get(&self, i: u8) -> Result<Player<'a>, ProgramError> {
        if i >= self.get_count().into() {
            return Err(SfsError::IndexOutOfRange.into());
        }
        Player::new(
            self.data,
            self.offset + 1 + i as usize * PlayerList::ITEM_SIZE,
        )
    }

    pub fn copy_to(&self, to: &mut [u8]) {
        let src = self.data.borrow();
        array_mut_ref![to, self.offset, PlayerList::LEN].copy_from_slice(array_ref![
            src,
            self.offset,
            PlayerList::LEN
        ]);
    }

    pub fn new(data: &'a RefCell<&'a [u8]>, offset: usize) -> Result<PlayerList, ProgramError> {
        if data.borrow().len() < Self::LEN + offset {
            return Err(ProgramError::InvalidInstructionData.into());
        }
        Ok(PlayerList { data, offset })
    }
}

// Pull in syscall stubs when building for non-BPF targets
#[cfg(not(target_arch = "bpf"))]

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
