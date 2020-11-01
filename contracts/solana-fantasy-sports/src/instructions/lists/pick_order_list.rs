//! State transition types

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
pub struct PickOrderList<'a> {
    data: &'a RefCell<&'a [u8]>,
    offset: usize,
}
impl<'a> PickOrderList<'a> {
    pub const ITEM_SIZE: usize = 1;
    pub const ITEM_COUNT: u8 = LEAGUE_USERS_CAPACITY;
    pub const LEN: usize = PickOrderList::ITEM_SIZE * PickOrderList::ITEM_COUNT as usize;
    fn slice<'b>(&self, data: &'b [u8], i: u8) -> &'b [u8; 1] {
        array_ref![
            data,
            self.offset + i as usize * PickOrderList::ITEM_SIZE as usize,
            PickOrderList::ITEM_SIZE
        ]
    }

    pub fn get(&self, i: u8) -> u8 {
        self.slice(&self.data.borrow(), i)[0]
    }

    pub fn copy_to(&self, to: &mut [u8]) {
        let src = self.data.borrow();
        array_mut_ref![to, self.offset, PickOrderList::LEN].copy_from_slice(array_ref![
            src,
            self.offset,
            PickOrderList::LEN
        ]);
    }

    pub fn new(data: &'a RefCell<&'a [u8]>, offset: usize) -> Result<PickOrderList, ProgramError> {
        if data.borrow().len() < Self::LEN + offset {
            return Err(ProgramError::InvalidInstructionData);
        }
        Ok(PickOrderList { data, offset })
    }
}

// Pull in syscall stubs when building for non-BPF targets
#[cfg(not(target_arch = "bpf"))]

#[cfg(test)]
mod tests {
    use super::*;

    // #[test]
    // fn test_pack_unpack() {
    //     let check = PickOrderList {
    //         list: [Player::default(); ITEM_COUNT],
    //     };
    //     let mut packed = vec![0; PickOrderList::get_packed_len() + 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         PickOrderList::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; PickOrderList::get_packed_len() - 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         PickOrderList::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; PickOrderList::get_packed_len()];
    //     PickOrderList::pack(check.clone(), &mut packed).unwrap();
    //     let expect = vec![0u8; ITEM_SIZE * ITEM_COUNT];
    //     assert_eq!(packed, expect);
    //     let unpacked = PickOrderList::unpack_unchecked(&packed).unwrap();
    //     assert_eq!(unpacked, check);

    //     let size = PickOrderList::get_packed_len();
    //     assert!(size < 100, "too large size, {} bytes", size);
    //     let size = std::mem::size_of::<PickOrderList>();
    //     assert!(size < 100, "too large size, {} bytes", size);
    // }
}
