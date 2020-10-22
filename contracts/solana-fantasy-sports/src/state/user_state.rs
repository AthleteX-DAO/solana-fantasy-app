//! State transition types
use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};
use solana_sdk::{
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
    pubkey::Pubkey,
};
use super::{
    lists::{BenchList, LineupList},
    consts::PUB_KEY_LEN,
    helpers::*
};

/// User data.
#[repr(C)]
#[derive(Clone, Debug, PartialEq)]
pub struct UserState {
    /// Player name.
    pub pub_key: Pubkey,
    pub bench: BenchList,
    pub lineups: LineupList,
    /// Is `true` if this structure has been initialized
    pub is_initialized: bool,
}
impl Sealed for UserState {}
impl IsInitialized for UserState {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}
impl Default for UserState {
    #[inline]
    fn default() -> Self {
        Self {
            pub_key: Pubkey::default(),
            bench: BenchList::default(),
            lineups: LineupList::default(),
            is_initialized: false
        }
    }
}
impl Pack for UserState {
    const LEN: usize = PUB_KEY_LEN + BenchList::LEN + LineupList::LEN + 1;
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, UserState::LEN];
        let (pub_key, bench, lineups, is_initialized) =
            array_refs![src, PUB_KEY_LEN, BenchList::LEN, LineupList::LEN, 1];
        Ok(UserState {
            pub_key: Pubkey::new_from_array(*pub_key),
            bench: BenchList::unpack_from_slice(bench).unwrap(),
            lineups: LineupList::unpack_from_slice(lineups).unwrap(),
            is_initialized: unpack_is_initialized(is_initialized).unwrap(),
        })
    }
    fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = array_mut_ref![dst, 0, UserState::LEN];
        let (
            pub_key_dst,
            bench_dst,
            lineups_dst,
            is_initialized_dst,
        ) = mut_array_refs![dst, PUB_KEY_LEN, BenchList::LEN, LineupList::LEN, 1];
        let &UserState {
            ref pub_key,
            ref bench,
            ref lineups,
            is_initialized,
        } = self;
        pub_key_dst.copy_from_slice(pub_key.as_ref());
        BenchList::pack(bench.clone(), bench_dst).unwrap();
        LineupList::pack(lineups.clone(), lineups_dst).unwrap();
        is_initialized_dst[0] = is_initialized as u8;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pack_unpack() {
        let check = UserState {
            pub_key: Pubkey::new(&[1; 32]),
            bench: BenchList::default(),
            lineups: LineupList::default(),
            is_initialized: true,
        };
        let mut packed = vec![0; UserState::get_packed_len() + 1];
        assert_eq!(
            Err(ProgramError::InvalidAccountData),
            UserState::pack(check.clone(), &mut packed)
        );
        let mut packed = vec![0; UserState::get_packed_len() - 1];
        assert_eq!(
            Err(ProgramError::InvalidAccountData),
            UserState::pack(check.clone(), &mut packed)
        );
        let mut packed = vec![0; UserState::get_packed_len()];
        UserState::pack(check.clone(), &mut packed).unwrap();
        let mut expect = vec![1u8; PUB_KEY_LEN];
        expect.extend_from_slice(&[0u8; BenchList::LEN]);
        expect.extend_from_slice(&[0u8; LineupList::LEN]);
        expect.extend_from_slice(&[1u8]);
        assert_eq!(packed, expect);
        let unpacked = UserState::unpack_unchecked(&packed).unwrap();
        assert_eq!(unpacked, check);
    }
}
