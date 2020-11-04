//! State transition types

use crate::error::SfsError;
use crate::state::*;
use arrayref::{array_mut_ref, array_ref, mut_array_refs};
use byteorder::{ByteOrder, LittleEndian};
use solana_program::{
    info,
    program_error::ProgramError,
    program_pack::{Pack, Sealed},
};
use std::cell::RefCell;
use user_player_list::UserPlayerList;

#[repr(C)]
pub struct PlayerList<'a> {
    data: &'a RefCell<&'a mut [u8]>,
    offset: usize,
}
impl<'a> PlayerList<'a> {
    pub const ITEM_SIZE: usize = Player::LEN;
    pub const ITEM_CAPACITY: u16 = consts::PLAYERS_CAPACITY;
    pub const LEN: usize = 2 + PlayerList::ITEM_SIZE * PlayerList::ITEM_CAPACITY as usize;
    fn slice<'b>(
        &self,
        data: &'b mut [u8],
    ) -> (
        &'b mut [u8; 2],
        &'b mut [u8; PlayerList::ITEM_SIZE * PlayerList::ITEM_CAPACITY as usize],
    ) {
        mut_array_refs![
            array_mut_ref![data, self.offset, PlayerList::LEN],
            2,
            PlayerList::ITEM_SIZE * PlayerList::ITEM_CAPACITY as usize
        ]
    }

    pub fn get_count(&self) -> u16 {
        LittleEndian::read_u16(self.slice(&mut self.data.borrow_mut()).0)
    }
    fn set_count(&self, value: u16) {
        LittleEndian::write_u16(self.slice(&mut self.data.borrow_mut()).0, value);
    }

    pub fn get_by_id(&self, id: u16) -> Result<Player<'a>, ProgramError> {
        if id == 0 || id > self.get_count() {
            return Err(SfsError::IndexOutOfRange.into());
        }
        Player::new(
            self.data,
            self.offset + 2 + (id as usize - 1) * PlayerList::ITEM_SIZE,
        )
    }

    pub fn add(&self, external_id: u16, position: Position) -> Result<(), ProgramError> {
        if self.get_count() >= PlayerList::ITEM_CAPACITY {
            return Err(SfsError::OutOfCapacity.into());
        }
        self.set_count(self.get_count() + 1);
        let player = self.get_by_id(self.get_count())?;
        player.set_external_id(external_id);
        player.set_position(position);
        player.set_is_initialized(true);
        Ok(())
    }

    pub fn copy_to(&self, to: &Self) {
        let mut dst = to.data.borrow_mut();
        let mut src = self.data.borrow_mut();
        array_mut_ref![dst, to.offset, PlayerList::LEN].copy_from_slice(array_mut_ref![
            src,
            self.offset,
            PlayerList::LEN
        ]);
    }

    pub fn new(data: &'a RefCell<&'a mut [u8]>, offset: usize) -> Result<PlayerList, ProgramError> {
        if data.borrow().len() < Self::LEN + offset {
            return Err(ProgramError::InvalidAccountData);
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
