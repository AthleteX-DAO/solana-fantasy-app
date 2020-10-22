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
    PackNext
};

/// Player data.
#[repr(C)]
#[derive(Clone, Debug, PartialEq)]
pub struct Player {
    /// Player name.
    pub id: u16,
    pub position: Position,
    pub scores: ScoreList,
    /// Is `true` if this structure has been initialized
    pub is_initialized: bool,
}
impl Sealed for Player {}
impl IsInitialized for Player {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}
impl Default for Player {
    #[inline]
    fn default() -> Self {
        Self {
            id: 0u16,
            position: Position::Uninitialized,
            scores: ScoreList::default(),
            is_initialized: false
        }
    }
}
impl Pack for Player {
    const LEN: usize = 2 + 1 + ScoreList::LEN + 1;
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, Player::LEN];
        let (id, position, scores_src, is_initialized) =
            array_refs![src, 2, 1, ScoreList::LEN, 1];
        Ok(Player {
            id: LittleEndian::read_u16(id),
            position: Position::try_from_primitive(position[0])
                .or(Err(ProgramError::InvalidAccountData))?,
            scores: ScoreList::unpack_from_slice(scores_src).unwrap(),
            is_initialized: unpack_is_initialized(is_initialized).unwrap(),
        })
    }
    fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = array_mut_ref![dst, 0, Player::LEN];
        let (
            id_dst,
            position_dst,
            scores_dst,
            is_initialized_dst,
        ) = mut_array_refs![dst, 2, 1, ScoreList::LEN, 1];
        let &Player {
            id,
            position,
            ref scores,
            is_initialized,
        } = self;
        LittleEndian::write_u16(id_dst, id);
        position_dst[0] = position as u8;
        scores.pack_into_slice(scores_dst);
        is_initialized_dst[0] = is_initialized as u8;
    }
}
impl PackNext for Player {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pack_unpack() {
        let check = Player {
            id: 12,
            position: Position::LB,
            scores: ScoreList::default(),
            is_initialized: true,
        };
        let mut packed = vec![0; Player::get_packed_len() + 1];
        assert_eq!(
            Err(ProgramError::InvalidAccountData),
            Player::pack(check.clone(), &mut packed)
        );
        let mut packed = vec![0; Player::get_packed_len() - 1];
        assert_eq!(
            Err(ProgramError::InvalidAccountData),
            Player::pack(check.clone(), &mut packed)
        );
        let mut packed = vec![0; Player::get_packed_len()];
        Player::pack(check.clone(), &mut packed).unwrap();
        let mut expect = vec![12u8, 0u8];
        expect.extend_from_slice(&[Position::LB as u8; 1]);
        expect.extend_from_slice(&[0u8; ScoreList::LEN]);
        expect.extend_from_slice(&[1u8]);
        assert_eq!(packed, expect);
        let unpacked = Player::unpack_unchecked(&packed).unwrap();
        assert_eq!(unpacked, check);
    }
}
