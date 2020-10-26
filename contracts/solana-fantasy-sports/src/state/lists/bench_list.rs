//! State transition types

use crate::state::*;
use arrayref::{array_mut_ref, array_ref};
use byteorder::{ByteOrder, LittleEndian};
use solana_sdk::{
    program_error::ProgramError,
    program_pack::{Pack, Sealed},
};
use std::cell::RefCell;
use std::io::{Error, ErrorKind};

#[repr(C)]
pub struct BenchList<'a> {
    data: &'a RefCell<&'a mut [u8]>,
    offset: usize,
}
impl<'a> BenchList<'a> {
    pub const ITEM_SIZE: usize = 2;
    pub const ITEM_COUNT: u8 = consts::TEAM_PLAYERS_COUNT;
    pub const LEN: usize = BenchList::ITEM_SIZE * BenchList::ITEM_COUNT as usize;
    fn slice<'b>(&self, data: &'b mut [u8], i: u8) -> &'b mut [u8; 2] {
        array_mut_ref![
            data,
            self.offset + i as usize * BenchList::ITEM_COUNT as usize,
            BenchList::ITEM_SIZE
        ]
    }

    pub fn get(&self, i: u8) -> u16 {
        LittleEndian::read_u16(self.slice(&mut self.data.borrow_mut(), i))
    }
    pub fn set(&self, i: u8, value: u16) {
        LittleEndian::write_u16(self.slice(&mut self.data.borrow_mut(), i), value);
    }

    pub fn contains_player_id(&self, player_id: u16) -> bool {
        return self.index_of(player_id).is_ok()
    }

    pub fn index_of(&self, player_id: u16) -> Result<u8, ()> {
        for i in 0..BenchList::LEN {
            if self.get(i as u8) == player_id {
                return Ok(i as u8);
            }
        }

        return Err(());
    }

    pub fn copy_to(&self, to: &Self) {
        let mut dst = to.data.borrow_mut();
        let mut src = self.data.borrow_mut();
        array_mut_ref![dst, self.offset, BenchList::LEN].copy_from_slice(array_mut_ref![
            src,
            self.offset,
            BenchList::LEN
        ]);
    }
    pub fn new(data: &'a RefCell<&'a mut [u8]>, offset: usize) -> Result<BenchList, ProgramError> {
        if data.borrow().len() < Self::LEN + offset {
            return Err(ProgramError::InvalidAccountData);
        }
        Ok(BenchList { data, offset })
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
    //     let check = BenchList {
    //         list: [0u16; ITEM_COUNT],
    //     };
    //     let mut packed = vec![0; BenchList::get_packed_len() + 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         BenchList::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; BenchList::get_packed_len() - 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         BenchList::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; BenchList::get_packed_len()];
    //     BenchList::pack(check.clone(), &mut packed).unwrap();
    //     let expect = vec![0u8; ITEM_SIZE * ITEM_COUNT];
    //     assert_eq!(packed, expect);
    //     let unpacked = BenchList::unpack_unchecked(&packed).unwrap();
    //     assert_eq!(unpacked, check.clone());

    //     let size = BenchList::get_packed_len();
    //     assert!(size < 100, "too large size, {} bytes", size);
    //     let size = std::mem::size_of::<BenchList>();
    //     assert!(size < 100, "too large size, {} bytes", size);
    // }
}
