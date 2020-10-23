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

#[repr(C)]
pub struct League<'a> {
    pub buf: &'a mut [u8;League::LEN],
}
impl<'a> League<'a> {
    pub const LEN: usize = 1 + UserStateList::LEN + 1;
    fn slice(self) -> (
        &'a mut [u8;1],
        &'a mut [u8;UserStateList::LEN],
        &'a mut [u8;1]) {
        mut_array_refs![
            self.buf,
            1,
            UserStateList::LEN,
            1
        ]
    }

    pub fn get_bid(self) -> u8 { self.slice().0[0] }
    pub fn set_bid(self, value: u8) { self.slice().0[0] = value; }

    pub fn get_user_states(self) -> UserStateList<'a> { UserStateList { buf: self.slice().1 } }

    pub fn get_is_initialized(self) -> bool { unpack_is_initialized(self.slice().2).unwrap() }
    pub fn set_is_initialized(self, value: bool) { self.slice().2[0] = value as u8; }

    pub fn copy_to(self, to: Self) {
        to.buf.copy_from_slice(self.buf);
    }
}

// Pull in syscall stubs when building for non-BPF targets
#[cfg(not(target_arch = "bpf"))]
solana_sdk::program_stubs!();

#[cfg(test)]
mod tests {
    use super::*;

    // #[test]
    // fn test_pack_unpack() {
    //     let check = League {
    //         bid: 5,
    //         user_states: UserStateList::default(),
    //         is_initialized: true,
    //     };
    //     let mut packed = vec![0; League::get_packed_len() + 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         League::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; League::get_packed_len() - 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         League::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; League::get_packed_len()];
    //     League::pack(check.clone(), &mut packed).unwrap();
    //     let mut expect = vec![5u8; 1];
    //     expect.extend_from_slice(&[0u8; UserStateList::LEN]);
    //     expect.extend_from_slice(&[1u8]);
    //     assert_eq!(packed, expect);
    //     let unpacked = League::unpack_unchecked(&packed).unwrap();
    //     assert_eq!(unpacked, check);


    //     let size = League::get_packed_len();
    //     assert!(size < 100, "too large size, {} bytes", size);
    //     let size = std::mem::size_of::<League>();
    //     assert!(size < 100, "too large size, {} bytes", size);
    // }
}
