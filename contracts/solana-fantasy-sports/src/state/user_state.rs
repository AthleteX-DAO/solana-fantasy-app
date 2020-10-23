//! State transition types
use super::{
    consts::PUB_KEY_LEN,
    helpers::*,
    lists::{BenchList, LineupList},
};
use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};
use solana_sdk::{
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
    pubkey::Pubkey,
};
use std::cell::RefCell;

#[repr(C)]
pub struct UserState<'a> {
    pub data: &'a RefCell<&'a mut [u8]>,
    pub offset: usize,
}
impl<'a> UserState<'a> {
    pub const LEN: usize = PUB_KEY_LEN + BenchList::LEN + LineupList::LEN + 1;
    fn slice<'b>(
        &self,
        data: &'b mut [u8],
    ) -> (
        &'b mut [u8; PUB_KEY_LEN],
        &'b mut [u8; BenchList::LEN],
        &'b mut [u8; LineupList::LEN],
        &'b mut [u8; 1],
    ) {
        mut_array_refs![
            array_mut_ref![data, self.offset, UserState::LEN],
            PUB_KEY_LEN,
            BenchList::LEN,
            LineupList::LEN,
            1
        ]
    }

    pub fn get_pub_key(self) -> Pubkey {
        Pubkey::new_from_array(*self.slice(&mut self.data.borrow_mut()).0)
    }
    pub fn set_pub_key(self, value: Pubkey) {
        self.slice(&mut self.data.borrow_mut())
            .0
            .copy_from_slice(value.as_ref());
    }

    pub fn get_scores(&self) -> BenchList<'a> {
        BenchList {
            data: self.data,
            offset: self.offset + PUB_KEY_LEN,
        }
    }

    pub fn get_lineups(&self) -> LineupList<'a> {
        LineupList {
            data: self.data,
            offset: self.offset + PUB_KEY_LEN + BenchList::LEN,
        }
    }

    pub fn get_is_initialized(self) -> bool {
        unpack_is_initialized(self.slice(&mut self.data.borrow_mut()).3).unwrap()
    }
    pub fn set_is_initialized(self, value: bool) {
        self.slice(&mut self.data.borrow_mut()).3[0] = value as u8;
    }

    pub fn copy_to(&self, to: &Self) {
        let mut dst = to.data.borrow_mut();
        let mut src = self.data.borrow_mut();
        array_mut_ref![dst, self.offset, BenchList::LEN].copy_from_slice(array_mut_ref![
            src,
            self.offset,
            BenchList::LEN
        ]);
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
    //     let check = UserState {
    //         pub_key: Pubkey::new(&[1; 32]),
    //         bench: BenchList::default(),
    //         lineups: LineupList::default(),
    //         is_initialized: true,
    //     };
    //     let mut packed = vec![0; UserState::get_packed_len() + 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         UserState::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; UserState::get_packed_len() - 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         UserState::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; UserState::get_packed_len()];
    //     UserState::pack(check.clone(), &mut packed).unwrap();
    //     let mut expect = vec![1u8; PUB_KEY_LEN];
    //     expect.extend_from_slice(&[0u8; BenchList::LEN]);
    //     expect.extend_from_slice(&[0u8; LineupList::LEN]);
    //     expect.extend_from_slice(&[1u8]);
    //     assert_eq!(packed, expect);
    //     let unpacked = UserState::unpack_unchecked(&packed).unwrap();
    //     assert_eq!(unpacked, check);

    //     let size = UserState::get_packed_len();
    //     assert!(size < 100, "too large size, {} bytes", size);
    //     let size = std::mem::size_of::<UserState>();
    //     assert!(size < 100, "too large size, {} bytes", size);
    // }
}
