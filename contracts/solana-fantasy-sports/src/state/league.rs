//! State transition types
use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};
use solana_sdk::{
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
};
use super::{
    lists::{UserStateList},
    helpers::*
};

/// League data.
#[repr(C)]
#[derive(Clone, Debug, Default, PartialEq)]
pub struct League {
    /// Bid
    pub bid: u8,
    /// Users
    pub user_states: UserStateList,
    /// Is `true` if this structure has been initialized
    pub is_initialized: bool,
}
impl Sealed for League {}
impl IsInitialized for League {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}
// impl Default for League {
//     // #[inline]
//     fn default() -> Self {
//         Self {
//             bid: 0,
//             user_states: UserStateList::default(),
//             is_initialized: false
//         }
//     }
// }
impl Pack for League {
    const LEN: usize = 1 + UserStateList::LEN + 1;
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, League::LEN];
        let (bid, user_states, is_initialized) =
            array_refs![src, 1, UserStateList::LEN, 1];
        Ok(League {
            bid: bid[0],
            user_states: UserStateList::unpack_unchecked(user_states).unwrap(),
            is_initialized: unpack_is_initialized(is_initialized).unwrap(),
        })
    }
    fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = array_mut_ref![dst, 0, League::LEN];
        let (
            bid_dst,
            user_states_dst,
            is_initialized_dst,
        ) = mut_array_refs![dst, 1, UserStateList::LEN , 1];
        let &League {
            bid,
            ref user_states,
            is_initialized,
        } = self;
        bid_dst[0] = bid;
        UserStateList::pack(user_states.clone(), user_states_dst).unwrap();
        is_initialized_dst[0] = is_initialized as u8;
    }
}

// Pull in syscall stubs when building for non-BPF targets
#[cfg(not(target_arch = "bpf"))]
solana_sdk::program_stubs!();

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pack_unpack() {
        let check = League {
            bid: 5,
            user_states: UserStateList::default(),
            is_initialized: true,
        };
        let mut packed = vec![0; League::get_packed_len() + 1];
        assert_eq!(
            Err(ProgramError::InvalidAccountData),
            League::pack(check.clone(), &mut packed)
        );
        let mut packed = vec![0; League::get_packed_len() - 1];
        assert_eq!(
            Err(ProgramError::InvalidAccountData),
            League::pack(check.clone(), &mut packed)
        );
        let mut packed = vec![0; League::get_packed_len()];
        League::pack(check.clone(), &mut packed).unwrap();
        let mut expect = vec![5u8; 1];
        expect.extend_from_slice(&[0u8; UserStateList::LEN]);
        expect.extend_from_slice(&[1u8]);
        assert_eq!(packed, expect);
        let unpacked = League::unpack_unchecked(&packed).unwrap();
        assert_eq!(unpacked, check);


        let size = League::get_packed_len();
        assert!(size < 100, "too large size, {} bytes", size);
        let size = std::mem::size_of::<League>();
        assert!(size < 100, "too large size, {} bytes", size);
    }
}
