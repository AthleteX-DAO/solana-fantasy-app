//! State transition types
use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};
use solana_sdk::{
    program_error::ProgramError,
    program_option::COption,
    program_pack::{IsInitialized, Pack, Sealed},
    pubkey::Pubkey,
};
use super::{
    lists::{PlayerList, LeagueList},
    consts::PUB_KEY_LEN,
    helpers::*
};

/// Root data.
#[repr(C)]
#[derive(Clone, Debug, PartialEq)]
pub struct Root {
    /// Oracle authority used to supply game scores.
    pub oracle_authority: COption<Pubkey>,
    /// An address of an account that stores the latest state.
    pub players: PlayerList,
    /// Leagues
    pub leagues: LeagueList,
    /// Is `true` if this structure has been initialized
    pub is_initialized: bool,
}
impl Sealed for Root {}
impl IsInitialized for Root {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}
impl Default for Root {
    #[inline]
    fn default() -> Self {
        Self {
            oracle_authority: COption::None,
            players: PlayerList::default(),
            leagues: LeagueList::default(),
            is_initialized: false
        }
    }
}
impl Pack for Root {
    const LEN: usize = 36 + PlayerList::LEN + LeagueList::LEN + 1;
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, Root::LEN];
        let (oracle_authority, players, leagues, is_initialized) =
            array_refs![src, 36, PlayerList::LEN, LeagueList::LEN, 1];
        Ok(Root {
            oracle_authority: unpack_coption_key(oracle_authority)?,
            players: PlayerList::unpack_unchecked(players).unwrap(),
            leagues: LeagueList::unpack_unchecked(leagues).unwrap(),
            is_initialized: unpack_is_initialized(is_initialized).unwrap(),
        })
    }
    fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = array_mut_ref![dst, 0, Root::LEN];
        let (
            oracle_authority_dst,
            players_dst,
            leagues_dst,
            is_initialized_dst,
        ) = mut_array_refs![dst, 36, PlayerList::LEN, LeagueList::LEN, 1];
        let &Root {
            ref oracle_authority,
            ref players,
            ref leagues,
            is_initialized,
        } = self;
        pack_coption_key(oracle_authority, oracle_authority_dst);
        PlayerList::pack(players.clone(), players_dst).unwrap();
        LeagueList::pack(leagues.clone(), leagues_dst).unwrap();
        is_initialized_dst[0] = is_initialized as u8;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pack_unpack() {
        let check = Root {
            oracle_authority: COption::Some(Pubkey::new(&[1; 32])),
            players: PlayerList::default(),
            leagues: LeagueList::default(),
            is_initialized: true,
        };
        let mut packed = vec![0; Root::get_packed_len() + 1];
        assert_eq!(
            Err(ProgramError::InvalidAccountData),
            Root::pack(check.clone(), &mut packed)
        );
        let mut packed = vec![0; Root::get_packed_len() - 1];
        assert_eq!(
            Err(ProgramError::InvalidAccountData),
            Root::pack(check.clone(), &mut packed)
        );
        let mut packed = vec![0; Root::get_packed_len()];
        Root::pack(check.clone(), &mut packed).unwrap();
        let mut expect = vec![1, 0, 0, 0];
        expect.extend_from_slice(&[1u8; 32]);
        expect.extend_from_slice(&[0u8; PlayerList::LEN]);
        expect.extend_from_slice(&[0u8; LeagueList::LEN]);
        expect.extend_from_slice(&[1u8]);
        assert_eq!(packed, expect);
        let unpacked = Root::unpack_unchecked(&packed).unwrap();
        assert_eq!(unpacked, check);
    }
}
