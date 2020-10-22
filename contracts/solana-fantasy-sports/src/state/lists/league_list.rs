//! State transition types

use arrayref::{array_mut_ref, array_ref};
use solana_sdk::{
    program_error::ProgramError,
    program_pack::{Pack, Sealed},
};
use crate::state::*;

const ITEM_SIZE: usize = League::LEN;
const ITEM_COUNT: usize = consts::LEAGUES_COUNT;

/// LeagueList data.
#[repr(C)]
#[derive(Clone, Debug, PartialEq)]
pub struct LeagueList {
    pub list: Vec<League>,
}
impl Sealed for LeagueList {}
impl Default for LeagueList {
    #[inline]
    fn default() -> Self {
        Self {
            list: vec![League::default(); ITEM_COUNT],
        }
    }
}
impl Pack for LeagueList {
    const LEN: usize = ITEM_SIZE * ITEM_COUNT;
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, ITEM_SIZE * ITEM_COUNT];
        let mut result = Self::default();
        for i in 0..ITEM_COUNT {
            let item_src = array_ref!(src, i * ITEM_SIZE, ITEM_SIZE);
            result.list[i] = League::unpack_unchecked(item_src).unwrap();
        }
        Ok(result)
    }
    fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = array_mut_ref![dst, 0, ITEM_SIZE * ITEM_COUNT];
        for i in 0..ITEM_COUNT {
            let item_dst = array_mut_ref!(dst, i * ITEM_SIZE, ITEM_SIZE);
            self.list[i].pack_into_slice(item_dst);
        }
    }
}
impl PackNext for LeagueList {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pack_unpack() {
        let check = LeagueList {
            list: vec![League::default(); ITEM_COUNT],
        };
        let mut packed = vec![0; LeagueList::get_packed_len() + 1];
        assert_eq!(
            Err(ProgramError::InvalidAccountData),
            LeagueList::pack(check.clone(), &mut packed)
        );
        let mut packed = vec![0; LeagueList::get_packed_len() - 1];
        assert_eq!(
            Err(ProgramError::InvalidAccountData),
            LeagueList::pack(check.clone(), &mut packed)
        );
        let mut packed = vec![0; LeagueList::get_packed_len()];
        LeagueList::pack(check.clone(), &mut packed).unwrap();
        let expect = vec![0u8; ITEM_SIZE * ITEM_COUNT];
        assert_eq!(packed, expect);
        let unpacked = LeagueList::unpack_unchecked(&packed).unwrap();
        assert_eq!(unpacked, check);
    }
}
