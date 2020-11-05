//! State transition types

use crate::state::*;
use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};
use solana_program::{
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
};
use byteorder::{ByteOrder, LittleEndian};
use std::cell::RefCell;

#[repr(C)]
pub struct Score<'a> {
    data: &'a RefCell<&'a mut [u8]>,
    offset: usize,
}
impl<'a> Score<'a> {
    pub const LEN: usize = 2 + 1;
    fn slice<'b>(&self, data: &'b mut [u8]) -> (&'b mut [u8; 2], &'b mut [u8; 1]) {
        mut_array_refs![array_mut_ref![data, self.offset, Score::LEN], 2, 1]
    }

    pub fn get_score1(&self) -> u16 {
        LittleEndian::read_u16(self.slice(&mut self.data.borrow_mut()).0)
    }
    pub fn set_score1(&self, value: u16) {
        LittleEndian::write_u16(self.slice(&mut self.data.borrow_mut()).0, value);
    }

    pub fn get_is_initialized(&self) -> Result<bool, ProgramError> {
        unpack_bool(self.slice(&mut self.data.borrow_mut()).1)
    }
    pub fn set_is_initialized(&self, value: bool) {
        self.slice(&mut self.data.borrow_mut()).1[0] = value as u8;
    }

    pub fn copy_to(&self, to: &Self) {
        let mut dst = to.data.borrow_mut();
        let mut src = self.data.borrow_mut();
        array_mut_ref![dst, to.offset, Score::LEN].copy_from_slice(array_mut_ref![
            src,
            self.offset,
            Score::LEN
        ]);
    }

    pub fn new(data: &'a RefCell<&'a mut [u8]>, offset: usize) -> Result<Score, ProgramError> {
        if data.borrow().len() < Self::LEN + offset {
            return Err(ProgramError::InvalidAccountData);
        }
        Ok(Score { data, offset })
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
