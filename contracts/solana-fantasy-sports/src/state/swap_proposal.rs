//! State transition types

use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};
use solana_sdk::{
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
    pubkey::Pubkey,
};
use super::{
    helpers::*,
    consts::PUB_KEY_LEN,
};

/// Player data.
#[repr(C)]
#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct SwapProposal {
    pub give_player_id: u8,
    pub want_player_id: u8,

    /// Is `true` if this structure has been initialized
    pub is_initialized: bool,
}
impl Sealed for SwapProposal {}
impl IsInitialized for SwapProposal {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}
impl Pack for SwapProposal {
    const LEN: usize = 3;
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, SwapProposal::LEN];
        let (give_player_id, want_player_id, is_initialized) =
            array_refs![src, 1, 1, 1];

        Ok(SwapProposal {
            give_player_id: give_player_id[0],
            want_player_id: want_player_id[0],
            is_initialized: unpack_is_initialized(is_initialized).unwrap(),
        })
    }
    fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = array_mut_ref![dst, 0, SwapProposal::LEN];
        let (
            give_player_id_dst,
            want_player_id_dst,
            is_initialized_dst,
        ) = mut_array_refs![dst, 1, 1, 1];
        let &SwapProposal {
            give_player_id, 
            want_player_id,
            is_initialized,
        } = self;
        give_player_id_dst[0] = give_player_id as u8;
        want_player_id_dst[0] = want_player_id as u8;
        is_initialized_dst[0] = is_initialized as u8;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pack_unpack() {
        let check = SwapProposal {
            give_player_id: 4, 
            want_player_id: 4,
            is_initialized: true,
        };
        let mut packed = vec![0; SwapProposal::get_packed_len() + 1];
        assert_eq!(
            Err(ProgramError::InvalidAccountData),
            SwapProposal::pack(check.clone(), &mut packed)
        );
        let mut packed = vec![0; SwapProposal::get_packed_len() - 1];
        assert_eq!(
            Err(ProgramError::InvalidAccountData),
            SwapProposal::pack(check.clone(), &mut packed)
        );
        let mut packed = vec![0; SwapProposal::get_packed_len()];
        SwapProposal::pack(check.clone(), &mut packed).unwrap();
        let mut expect = vec![35u8; 1];
        expect.extend_from_slice(&[1u8]);
        assert_eq!(packed, expect);
        let unpacked = SwapProposal::unpack_unchecked(&packed).unwrap();
        assert_eq!(unpacked, check);
    }
}
