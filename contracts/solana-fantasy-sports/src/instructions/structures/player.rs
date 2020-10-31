//! State transition types
use crate::instructions::*;
use crate::state::structures::Position;
use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};
use byteorder::{ByteOrder, LittleEndian};
use num_enum::TryFromPrimitive;
use solana_program::{
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
};
use std::cell::RefCell;

#[repr(C)]
pub struct Player<'a> {
    data: &'a RefCell<&'a [u8]>,
    offset: usize,
}
impl<'a> Player<'a> {
    pub const LEN: usize = 2 + 1;
    fn slice<'b>(&self, data: &'b [u8]) -> (&'b [u8; 2], &'b [u8; 1]) {
        array_refs![array_ref![data, self.offset, Player::LEN], 2, 1]
    }

    pub fn get_external_id(&self) -> u16 {
        LittleEndian::read_u16(self.slice(&mut self.data.borrow()).0)
    }

    pub fn get_position(&self) -> Result<Position, ProgramError> {
        Position::try_from_primitive(self.slice(&mut self.data.borrow()).1[0])
            .or(Err(ProgramError::InvalidInstructionData))
    }

    pub fn copy_to(&self, to: &mut [u8]) {
        let src = self.data.borrow();
        array_mut_ref![to, self.offset, Player::LEN].copy_from_slice(array_ref![
            src,
            self.offset,
            Player::LEN
        ]);
    }

    pub fn pack(id: u16, position: Position) -> [u8; Player::LEN] {
        let mut buf = [0u8; Player::LEN];
        LittleEndian::write_u16(&mut buf, id);
        buf[2] = position as u8;
        buf
    }

    pub fn new(data: &'a RefCell<&'a [u8]>, offset: usize) -> Result<Player, ProgramError> {
        if data.borrow().len() < Self::LEN + offset {
            return Err(ProgramError::InvalidInstructionData);
        }
        Ok(Player { data, offset })
    }
}

// Pull in syscall stubs when building for non-BPF targets
#[cfg(not(target_arch = "bpf"))]

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
