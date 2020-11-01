//! State transition types

use crate::error::SfsError;
use crate::state::*;
use arrayref::{array_mut_ref, array_ref, mut_array_refs};
use byteorder::{ByteOrder, LittleEndian};
use solana_program::{
    program_error::ProgramError,
    program_pack::{Pack, Sealed},
};
use std::cell::RefCell;

#[repr(C)]
pub struct UserPlayerList<'a> {
    data: &'a RefCell<&'a mut [u8]>,
    offset: usize,
}
impl<'a> UserPlayerList<'a> {
    pub const ITEM_SIZE: usize = 2;
    pub const ITEM_COUNT: u8 = consts::TEAM_PLAYERS_COUNT;
    pub const LEN: usize = UserPlayerList::ITEM_SIZE * UserPlayerList::ITEM_COUNT as usize;
    fn slice<'b>(&self, data: &'b mut [u8], i: u8) -> &'b mut [u8; 2] {
        array_mut_ref![
            data,
            self.offset + i as usize * UserPlayerList::ITEM_SIZE as usize,
            UserPlayerList::ITEM_SIZE
        ]
    }

    pub fn get(&self, i: u8) -> u16 {
        LittleEndian::read_u16(self.slice(&mut self.data.borrow_mut(), i))
    }
    pub fn set(&self, i: u8, value: u16) {
        LittleEndian::write_u16(self.slice(&mut self.data.borrow_mut(), i), value);
    }

    pub fn contains(&self, player_id: u16) -> bool {
        return self.index_of(player_id).is_ok();
    }

    pub fn index_of(&self, player_id: u16) -> Result<u8, ProgramError> {
        for i in 0..UserPlayerList::LEN {
            if self.get(i as u8) == player_id {
                return Ok(i as u8);
            }
        }

        return Err(SfsError::PlayerNotFound.into());
    }

    pub fn copy_to(&self, to: &Self) {
        let mut dst = to.data.borrow_mut();
        let mut src = self.data.borrow_mut();
        array_mut_ref![dst, self.offset, UserPlayerList::LEN].copy_from_slice(array_mut_ref![
            src,
            self.offset,
            UserPlayerList::LEN
        ]);
    }

    pub fn new(
        data: &'a RefCell<&'a mut [u8]>,
        offset: usize,
    ) -> Result<UserPlayerList, ProgramError> {
        if data.borrow().len() < Self::LEN + offset {
            return Err(ProgramError::InvalidAccountData);
        }
        Ok(UserPlayerList { data, offset })
    }
}

// Pull in syscall stubs when building for non-BPF targets
#[cfg(not(target_arch = "bpf"))]

#[cfg(test)]
mod tests {
    use super::*;

    // #[test]
    // fn test_pack_unpack() {
    //     let check = UserPlayerList {
    //         list: [Player::default(); ITEM_COUNT],
    //     };
    //     let mut packed = vec![0; UserPlayerList::get_packed_len() + 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         UserPlayerList::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; UserPlayerList::get_packed_len() - 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         UserPlayerList::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; UserPlayerList::get_packed_len()];
    //     UserPlayerList::pack(check.clone(), &mut packed).unwrap();
    //     let expect = vec![0u8; ITEM_SIZE * ITEM_COUNT];
    //     assert_eq!(packed, expect);
    //     let unpacked = UserPlayerList::unpack_unchecked(&packed).unwrap();
    //     assert_eq!(unpacked, check);

    //     let size = UserPlayerList::get_packed_len();
    //     assert!(size < 100, "too large size, {} bytes", size);
    //     let size = std::mem::size_of::<UserPlayerList>();
    //     assert!(size < 100, "too large size, {} bytes", size);
    // }
}
