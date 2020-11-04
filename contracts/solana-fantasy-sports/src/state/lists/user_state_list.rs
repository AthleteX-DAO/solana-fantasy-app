//! State transition types

use crate::error::SfsError;
use crate::state::*;
use arrayref::{array_mut_ref, array_ref, mut_array_refs};
use byteorder::{ByteOrder, LittleEndian};
use solana_program::{
    program_error::ProgramError,
    program_pack::{Pack, Sealed},
    pubkey::Pubkey,
};
use std::{cell::RefCell, io};

#[repr(C)]
pub struct UserStateList<'a> {
    data: &'a RefCell<&'a mut [u8]>,
    pub offset: usize,
}
impl<'a> UserStateList<'a> {
    pub const ITEM_SIZE: usize = UserState::LEN;
    pub const ITEM_CAPACITY: u8 = consts::LEAGUE_USERS_CAPACITY;
    pub const LEN: usize = 1 + UserStateList::ITEM_SIZE * UserStateList::ITEM_CAPACITY as usize;
    fn slice<'b>(
        &self,
        data: &'b mut [u8],
    ) -> (
        &'b mut [u8; 1],
        &'b mut [u8; UserStateList::ITEM_SIZE * UserStateList::ITEM_CAPACITY as usize],
    ) {
        mut_array_refs![
            array_mut_ref![data, self.offset, UserStateList::LEN],
            1,
            UserStateList::ITEM_SIZE * UserStateList::ITEM_CAPACITY as usize
        ]
    }

    pub fn get_count(&self) -> u8 {
        self.slice(&mut self.data.borrow_mut()).0[0]
    }
    fn set_count(&self, value: u8) {
        self.slice(&mut self.data.borrow_mut()).0[0] = value;
    }

    pub fn get_by_id(&self, id: u8) -> Result<UserState<'a>, ProgramError> {
        if id == 0 || id > self.get_count() {
            return Err(SfsError::IndexOutOfRange.into());
        }
        UserState::new(
            self.data,
            self.offset + 1 + (id as usize - 1) * UserStateList::ITEM_SIZE,
        )
    }

    pub fn add(&self, pubkey: Pubkey) -> Result<UserState<'a>, ProgramError> {
        if self.get_count() >= UserStateList::ITEM_CAPACITY {
            return Err(SfsError::OutOfCapacity.into());
        }
        for i in 1..self.get_count() + 1 {
            if self.get_by_id(i)?.get_pub_key() == pubkey {
                return Err(SfsError::AlreadyInUse.into());
            }
        }
        self.set_count(self.get_count() + 1);
        let user_state = self.get_by_id(self.get_count())?;
        user_state.set_pub_key(pubkey);
        user_state.set_is_initialized(true);
        Ok(user_state)
    }

    pub fn copy_to(&self, to: &Self) {
        let mut dst = to.data.borrow_mut();
        let mut src = self.data.borrow_mut();
        array_mut_ref![dst, to.offset, UserStateList::LEN].copy_from_slice(array_mut_ref![
            src,
            self.offset,
            UserStateList::LEN
        ]);
    }
    pub fn new(
        data: &'a RefCell<&'a mut [u8]>,
        offset: usize,
    ) -> Result<UserStateList, ProgramError> {
        if data.borrow().len() < Self::LEN + offset {
            return Err(ProgramError::InvalidAccountData);
        }
        Ok(UserStateList { data, offset })
    }
}

// Pull in syscall stubs when building for non-BPF targets
#[cfg(not(target_arch = "bpf"))]
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
