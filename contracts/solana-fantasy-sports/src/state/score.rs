//! State transition types

use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};
use solana_sdk::{
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
};
use super::{
    helpers::*
};

/// Player data.
#[repr(C)]
#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct Score {
    /// score
    pub score1: u8,
    /* TODO: more scores here */

    /// Is `true` if this structure has been initialized
    pub is_initialized: bool,
}
impl Sealed for Score {}
impl IsInitialized for Score {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}
impl Pack for Score {
    const LEN: usize = 2;
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, Score::LEN];
        let (score1, /* TODO: more scores here */ is_initialized) =
            array_refs![src, 1, 1];
        /* TODO: more scores here */
        Ok(Score {
            score1: score1[0],
            is_initialized: unpack_is_initialized(is_initialized).unwrap(),
        })
    }
    fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = array_mut_ref![dst, 0, Score::LEN];
        let (
            score1_dst,
            /* TODO: more scores here */
            is_initialized_dst,
        ) = mut_array_refs![dst, 1, 1];
        let &Score {
            score1,
            is_initialized,
        } = self;
        score1_dst[0] = score1;
        is_initialized_dst[0] = is_initialized as u8;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pack_unpack() {
        let check = Score {
            score1: 4,
            is_initialized: true,
        };
        let mut packed = vec![0; Score::get_packed_len() + 1];
        assert_eq!(
            Err(ProgramError::InvalidAccountData),
            Score::pack(check.clone(), &mut packed)
        );
        let mut packed = vec![0; Score::get_packed_len() - 1];
        assert_eq!(
            Err(ProgramError::InvalidAccountData),
            Score::pack(check.clone(), &mut packed)
        );
        let mut packed = vec![0; Score::get_packed_len()];
        Score::pack(check.clone(), &mut packed).unwrap();
        let mut expect = vec![4u8; 1];
        expect.extend_from_slice(&[1u8]);
        assert_eq!(packed, expect);
        let unpacked = Score::unpack_unchecked(&packed).unwrap();
        assert_eq!(unpacked, check);
    }
}
