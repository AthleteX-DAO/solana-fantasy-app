//! State transition types

use byteorder::{ByteOrder, LittleEndian};
use arrayref::{array_mut_ref, array_ref};
use solana_sdk::{
    program_error::ProgramError,
    program_pack::{Pack, Sealed},
};
use crate::state::*;

const ITEM_SIZE: usize = 2;
const ITEM_COUNT: usize = consts::TEAM_PLAYERS_COUNT;

/// BenchList data.
#[repr(C)]
#[derive(Clone, Debug, PartialEq)]
pub struct BenchList {
    pub list: Vec<u16>,
}
impl Sealed for BenchList {}
impl Default for BenchList {
    #[inline]
    fn default() -> Self {
        Self {
            list: vec![0u16; ITEM_COUNT],
        }
    }
}
impl Pack for BenchList {
    const LEN: usize = ITEM_SIZE * ITEM_COUNT;
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, ITEM_SIZE * ITEM_COUNT];
        let mut result = Self::default();
        for i in 0..ITEM_COUNT {
            let item_src = array_ref!(src, i * ITEM_SIZE, ITEM_SIZE);
            result.list[i] = LittleEndian::read_u16(item_src);
        }
        Ok(result)
    }
    fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = array_mut_ref![dst, 0, ITEM_SIZE * ITEM_COUNT];
        for i in 0..ITEM_COUNT {
            let item_dst = array_mut_ref!(dst, i * ITEM_SIZE, ITEM_SIZE);
            LittleEndian::write_u16(item_dst, self.list[i]);
        }
    }
}
impl PackNext for BenchList {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pack_unpack() {
        let check = BenchList {
            list: vec![0u16; ITEM_COUNT],
        };
        let mut packed = vec![0; BenchList::get_packed_len() + 1];
        assert_eq!(
            Err(ProgramError::InvalidAccountData),
            BenchList::pack(check.clone(), &mut packed)
        );
        let mut packed = vec![0; BenchList::get_packed_len() - 1];
        assert_eq!(
            Err(ProgramError::InvalidAccountData),
            BenchList::pack(check.clone(), &mut packed)
        );
        let mut packed = vec![0; BenchList::get_packed_len()];
        BenchList::pack(check.clone(), &mut packed).unwrap();
        let expect = vec![0u8; ITEM_SIZE * ITEM_COUNT];
        assert_eq!(packed, expect);
        let unpacked = BenchList::unpack_unchecked(&packed).unwrap();
        assert_eq!(unpacked, check.clone());
    }
}
