//! State transition types

use byteorder::{ByteOrder, LittleEndian};
use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};
use num_enum::TryFromPrimitive;
use solana_sdk::{
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
};
use super::{
    Position,
    lists::{ScoreList},
    helpers::*,
};
use std::{
    cell::{Ref, RefCell, RefMut},
    cmp, fmt,
    rc::Rc,
};

#[repr(C)]
pub struct Player<'a> {
    pub buf: &'a RefCell<&'a mut [u8]>,
    pub offset: usize,
}
impl<'a> Player<'a> {
    pub const LEN: usize = 2 + 1 + ScoreList::LEN + 1;
    fn slice<'b>(&self, data: &'b mut [u8]) -> (
        &'b mut [u8;2],
        &'b mut [u8;1],
        &'b mut [u8;ScoreList::LEN],
        &'b mut [u8;1]) {
        mut_array_refs![
            array_mut_ref![data, self.offset, Player::LEN],
            2,
            1,
            ScoreList::LEN,
            1
        ]
    }

    pub fn get_id(&self) -> u16 { LittleEndian::read_u16(self.slice(&mut self.buf.borrow_mut()).0) }
    pub fn set_id(&self, value: u16) { LittleEndian::write_u16(self.slice(&mut self.buf.borrow_mut()).0, value); }

    pub fn get_position(&self) -> Position {
        Position::try_from_primitive(self.slice(&mut self.buf.borrow_mut()).1[0])
                .or(Err(ProgramError::InvalidAccountData)).unwrap()
    }
    pub fn set_position(&self, value: Position) { self.slice(&mut self.buf.borrow_mut()).1[0] = value as u8; }

    pub fn get_scores(&self) -> ScoreList<'a> { ScoreList { buf: self.buf, offset: self.offset + 2 + 1 } }

    pub fn get_is_initialized(&self) -> bool { unpack_is_initialized(self.slice(&mut self.buf.borrow_mut()).3).unwrap() }
    pub fn set_is_initialized(&self, value: bool) { self.slice(&mut self.buf.borrow_mut()).3[0] = value as u8; }

    // pub fn copy_to(self, to: Self) {
    //     to.buf.copy_from_slice(self.buf);
    // }
}

// Pull in syscall stubs when building for non-BPF targets
#[cfg(not(target_arch = "bpf"))]
solana_sdk::program_stubs!();

#[cfg(test)]
mod tests {
    use super::*;

    // #[test]
    // fn test_pack_unpack() {
    //     let check = Player {
    //         id: 12,
    //         position: Position::LB,
    //         scores: ScoreList::default(),
    //         is_initialized: true,
    //     };
    //     let mut packed = vec![0; Player::get_packed_len() + 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         Player::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; Player::get_packed_len() - 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         Player::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; Player::get_packed_len()];
    //     Player::pack(check.clone(), &mut packed).unwrap();
    //     let mut expect = vec![12u8, 0u8];
    //     expect.extend_from_slice(&[Position::LB as u8; 1]);
    //     expect.extend_from_slice(&[0u8; ScoreList::LEN]);
    //     expect.extend_from_slice(&[1u8]);
    //     assert_eq!(packed, expect);
    //     let unpacked = Player::unpack_unchecked(&packed).unwrap();
    //     assert_eq!(unpacked, check);

    //     let size = Player::get_packed_len();
    //     assert!(size < 100, "too large size, {} bytes", size);
    //     let size = std::mem::size_of::<Player>();
    //     assert!(size < 100, "too large size, {} bytes", size);
    // }
}
