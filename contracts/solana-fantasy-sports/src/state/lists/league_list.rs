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
pub struct LeagueList<'a> {
    data: &'a RefCell<&'a mut [u8]>,
    offset: usize,
}
impl<'a> LeagueList<'a> {
    pub const ITEM_SIZE: usize = League::LEN;
    pub const ITEM_CAPACITY: u16 = consts::LEAGUES_CAPACITY;
    pub const LEN: usize = 2 + LeagueList::ITEM_SIZE * LeagueList::ITEM_CAPACITY as usize;
    fn slice<'b>(
        &self,
        data: &'b mut [u8],
    ) -> (
        &'b mut [u8; 2],
        &'b mut [u8; LeagueList::ITEM_SIZE * LeagueList::ITEM_CAPACITY as usize],
    ) {
        mut_array_refs![
            array_mut_ref![data, self.offset, LeagueList::LEN],
            2,
            LeagueList::ITEM_SIZE * LeagueList::ITEM_CAPACITY as usize
        ]
    }

    pub fn get_count(&self) -> u16 {
        LittleEndian::read_u16(self.slice(&mut self.data.borrow_mut()).0)
    }
    fn set_count(&self, value: u16) {
        LittleEndian::write_u16(self.slice(&mut self.data.borrow_mut()).0, value);
    }

    pub fn get(&self, i: u16) -> Result<League<'a>, ProgramError> {
        if i >= self.get_count() {
            return Err(SfsError::IndexOutOfRange.into());
        }
        League::new(
            self.data,
            self.offset + 2 + i as usize * LeagueList::ITEM_SIZE,
        )
    }

    pub fn create(&self) -> Result<League<'a>, ProgramError> {
        if self.get_count() >= LeagueList::ITEM_CAPACITY {
            return Err(SfsError::OutOfCapacity.into());
        }
        self.set_count(self.get_count() + 1);
        let league = self.get(self.get_count() - 1)?;
        Ok(league)
    }

    pub fn copy_to(&self, to: &Self) {
        let mut dst = to.data.borrow_mut();
        let mut src = self.data.borrow_mut();
        array_mut_ref![dst, to.offset, LeagueList::LEN].copy_from_slice(array_mut_ref![
            src,
            self.offset,
            LeagueList::LEN
        ]);
    }

    pub fn new(data: &'a RefCell<&'a mut [u8]>, offset: usize) -> Result<LeagueList, ProgramError> {
        if data.borrow().len() < Self::LEN + offset {
            return Err(ProgramError::InvalidAccountData);
        }
        Ok(LeagueList { data, offset })
    }
}

// Pull in syscall stubs when building for non-BPF targets
#[cfg(not(target_arch = "bpf"))]

#[cfg(test)]
mod tests {
    use super::*;

    // #[test]
    // fn test_pack_unpack() {
    //     let check = LeagueList {
    //         list: [League::default(); ITEM_COUNT],
    //     };
    //     let mut packed = vec![0; LeagueList::get_packed_len() + 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         LeagueList::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; LeagueList::get_packed_len() - 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         LeagueList::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; LeagueList::get_packed_len()];
    //     LeagueList::pack(check.clone(), &mut packed).unwrap();
    //     let expect = vec![0u8; ITEM_SIZE * ITEM_COUNT];
    //     assert_eq!(packed, expect);
    //     let unpacked = LeagueList::unpack_unchecked(&packed).unwrap();
    //     assert_eq!(unpacked, check);

    //     let size = LeagueList::get_packed_len();
    //     assert!(size < 100, "too large size, {} bytes", size);
    //     let size = std::mem::size_of::<LeagueList>();
    //     assert!(size < 100, "too large size, {} bytes", size);
    // }
}
