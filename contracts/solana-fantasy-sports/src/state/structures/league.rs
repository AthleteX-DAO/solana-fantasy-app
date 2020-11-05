//! State transition types
use crate::state::*;
use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};
use byteorder::{ByteOrder, LittleEndian};
use solana_program::{
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
};
use std::cell::RefCell;

#[repr(C)]
pub struct League<'a> {
    data: &'a RefCell<&'a mut [u8]>,
    offset: usize,
}
impl<'a> League<'a> {
    pub const LEN: usize = UserStateList::LEN + LEAGUE_NAME_LEN + 8 + 1 + 2 + 1 + 1 + 1;
    fn slice<'b>(
        &self,
        data: &'b mut [u8],
    ) -> (
        &'b mut [u8; UserStateList::LEN],
        &'b mut [u8; LEAGUE_NAME_LEN],
        &'b mut [u8; 8],
        &'b mut [u8; 1],
        &'b mut [u8; 2],
        &'b mut [u8; 1],
        &'b mut [u8; 1],
        &'b mut [u8; 1],
    ) {
        mut_array_refs![
            array_mut_ref![data, self.offset, League::LEN],
            UserStateList::LEN,
            LEAGUE_NAME_LEN,
            8,
            1,
            2,
            1,
            1,
            1
        ]
    }

    pub fn get_user_states(&self) -> Result<UserStateList<'a>, ProgramError> {
        UserStateList::new(self.data, self.offset)
    }

    pub fn get_name(&self) -> [u8; LEAGUE_NAME_LEN] {
        *self.slice(&mut self.data.borrow_mut()).1
    }
    pub fn set_name(&self, value: &[u8; LEAGUE_NAME_LEN]) {
        self.slice(&mut self.data.borrow_mut())
            .1
            .copy_from_slice(value);
    }

    pub fn get_bid(&self) -> u64 {
        LittleEndian::read_u64(self.slice(&mut self.data.borrow_mut()).2)
    }
    pub fn set_bid(&self, value: u64) {
        LittleEndian::write_u64(self.slice(&mut self.data.borrow_mut()).2, value)
    }

    pub fn get_users_limit(&self) -> u8 {
        self.slice(&mut self.data.borrow_mut()).3[0]
    }
    pub fn set_users_limit(&self, value: u8) {
        self.slice(&mut self.data.borrow_mut()).3[0] = value;
    }

    pub fn get_current_pick(&self) -> u16 {
        LittleEndian::read_u16(self.slice(&mut self.data.borrow_mut()).4)
    }
    pub fn set_current_pick(&self, value: u16) {
        LittleEndian::write_u16(self.slice(&mut self.data.borrow_mut()).4, value);
    }

    pub fn get_start_week(&self) -> u8 {
        self.slice(&mut self.data.borrow_mut()).5[0]
    }
    pub fn set_start_week(&self, value: u8) {
        self.slice(&mut self.data.borrow_mut()).5[0] = value;
    }

    pub fn get_is_reward_claimed(&self) -> Result<bool, ProgramError> {
        unpack_bool(self.slice(&mut self.data.borrow_mut()).6)
    }
    pub fn set_is_reward_claimed(&self, value: bool) {
        self.slice(&mut self.data.borrow_mut()).6[0] = value as u8;
    }

    pub fn get_is_initialized(&self) -> Result<bool, ProgramError> {
        unpack_bool(self.slice(&mut self.data.borrow_mut()).7)
    }
    pub fn set_is_initialized(&self, value: bool) {
        self.slice(&mut self.data.borrow_mut()).7[0] = value as u8;
    }

    pub fn get_pick_round(&self) -> Result<u8, ProgramError> {
        Ok((self.get_current_pick() / self.get_user_states()?.get_count() as u16) as u8)
    }

    pub fn copy_to(&self, to: &Self) {
        let mut dst = to.data.borrow_mut();
        let mut src = self.data.borrow_mut();
        array_mut_ref![dst, to.offset, League::LEN].copy_from_slice(array_mut_ref![
            src,
            self.offset,
            League::LEN
        ]);
    }

    pub fn new(data: &'a RefCell<&'a mut [u8]>, offset: usize) -> Result<League, ProgramError> {
        if data.borrow().len() < Self::LEN + offset {
            return Err(ProgramError::InvalidAccountData);
        }
        Ok(League { data, offset })
    }
}

// Pull in syscall stubs when building for non-BPF targets
#[cfg(not(target_arch = "bpf"))]
#[cfg(test)]
mod tests {
    use super::*;

    // #[test]
    // fn test_pack_unpack() {
    //     let check = League {
    //         bid: 5,
    //         user_states: UserStateList::default(),
    //         is_initialized: true,
    //     };
    //     let mut packed = vec![0; League::get_packed_len() + 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         League::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; League::get_packed_len() - 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         League::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; League::get_packed_len()];
    //     League::pack(check.clone(), &mut packed).unwrap();
    //     let mut expect = vec![5u8; 1];
    //     expect.extend_from_slice(&[0u8; UserStateList::LEN]);
    //     expect.extend_from_slice(&[1u8]);
    //     assert_eq!(packed, expect);
    //     let unpacked = League::unpack_unchecked(&packed).unwrap();
    //     assert_eq!(unpacked, check);

    //     let size = League::get_packed_len();
    //     assert!(size < 100, "too large size, {} bytes", size);
    //     let size = std::mem::size_of::<League>();
    //     assert!(size < 100, "too large size, {} bytes", size);
    // }
}
