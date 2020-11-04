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
pub struct ActivePlayersList<'a> {
    data: &'a RefCell<&'a [u8]>,
    offset: usize,
}
impl<'a> ActivePlayersList<'a> {
    pub const ITEM_SIZE: usize = 2;
    pub const ITEM_COUNT: u8 = ACTIVE_PLAYERS_COUNT;
    pub const LEN: usize = ActivePlayersList::ITEM_SIZE * ActivePlayersList::ITEM_COUNT as usize;
    fn slice<'b>(&self, data: &'b [u8], i: u8) -> &'b [u8; 2] {
        array_ref![
            data,
            self.offset + i as usize * ActivePlayersList::ITEM_SIZE as usize,
            ActivePlayersList::ITEM_SIZE
        ]
    }

    pub fn get(&self, i: u8) -> u16 {
        LittleEndian::read_u16(self.slice(&self.data.borrow(), i))
    }

    pub fn contains(&self, player_id: u16) -> bool {
        return self.index_of(player_id).is_ok();
    }

    pub fn index_of(&self, player_id: u16) -> Result<u8, ProgramError> {
        for i in 0..ActivePlayersList::ITEM_COUNT {
            if self.get(i as u8) == player_id {
                return Ok(i as u8);
            }
        }

        return Err(SfsError::PlayerNotFound.into());
    }

    pub fn copy_to(&self, to: &mut [u8]) {
        let src = self.data.borrow();
        array_mut_ref![to, self.offset, ActivePlayersList::LEN].copy_from_slice(array_ref![
            src,
            self.offset,
            ActivePlayersList::LEN
        ]);
    }

    pub fn new(
        data: &'a RefCell<&'a [u8]>,
        offset: usize,
    ) -> Result<ActivePlayersList, ProgramError> {
        if data.borrow().len() < Self::LEN + offset {
            return Err(ProgramError::InvalidInstructionData);
        }
        Ok(ActivePlayersList { data, offset })
    }
}

// Pull in syscall stubs when building for non-BPF targets
#[cfg(not(target_arch = "bpf"))]

#[cfg(test)]
mod tests {
    use super::*;

    // #[test]
    // fn test_pack_unpack() {
    //     let check = ActivePlayersList {
    //         list: [Player::default(); ITEM_COUNT],
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
    //     assert_eq!(unpacked, check);

    //     let size = ActivePlayersList::get_packed_len();
    //     assert!(size < 100, "too large size, {} bytes", size);
    //     let size = std::mem::size_of::<ActivePlayersList>();
    //     assert!(size < 100, "too large size, {} bytes", size);
    // }
}
