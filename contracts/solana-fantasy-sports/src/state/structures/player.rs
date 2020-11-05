//! State transition types
use crate::state::*;
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
    data: &'a RefCell<&'a mut [u8]>,
    offset: usize,
}
impl<'a> Player<'a> {
    pub const LEN: usize = ScoreList::LEN + 2 + 1 + 1;
    fn slice<'b>(
        &self,
        data: &'b mut [u8],
    ) -> (
        &'b mut [u8; ScoreList::LEN],
        &'b mut [u8; 2],
        &'b mut [u8; 1],
        &'b mut [u8; 1],
    ) {
        mut_array_refs![
            array_mut_ref![data, self.offset, Player::LEN],
            ScoreList::LEN,
            2,
            1,
            1
        ]
    }

    pub fn get_scores(&self) -> Result<ScoreList<'a>, ProgramError> {
        ScoreList::new(self.data, self.offset)
    }

    pub fn get_external_id(&self) -> u16 {
        LittleEndian::read_u16(self.slice(&mut self.data.borrow_mut()).1)
    }
    pub fn set_external_id(&self, value: u16) {
        LittleEndian::write_u16(self.slice(&mut self.data.borrow_mut()).1, value);
    }

    pub fn get_position(&self) -> Result<Position, ProgramError> {
        Position::try_from_primitive(self.slice(&mut self.data.borrow_mut()).2[0])
            .or(Err(ProgramError::InvalidAccountData))
    }
    pub fn set_position(&self, value: Position) {
        self.slice(&mut self.data.borrow_mut()).2[0] = value as u8;
    }

    pub fn get_is_initialized(&self) -> Result<bool, ProgramError> {
        unpack_bool(self.slice(&mut self.data.borrow_mut()).3)
    }
    pub fn set_is_initialized(&self, value: bool) {
        self.slice(&mut self.data.borrow_mut()).3[0] = value as u8;
    }

    pub fn copy_to(&self, to: &Self) {
        let mut dst = to.data.borrow_mut();
        let mut src = self.data.borrow_mut();
        array_mut_ref![dst, to.offset, Player::LEN].copy_from_slice(array_mut_ref![
            src,
            self.offset,
            Player::LEN
        ]);
    }

    pub fn new(data: &'a RefCell<&'a mut [u8]>, offset: usize) -> Result<Player, ProgramError> {
        if data.borrow().len() < Self::LEN + offset {
            return Err(ProgramError::InvalidAccountData);
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
