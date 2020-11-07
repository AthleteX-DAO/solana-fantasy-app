//! State transition types
use crate::state::*;
use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};
use solana_program::{
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
    pubkey::Pubkey,
};
use std::cell::RefCell;

#[repr(C)]
pub struct UserState<'a> {
    data: &'a RefCell<&'a mut [u8]>,
    offset: usize,
}
impl<'a> UserState<'a> {
    pub const LEN: usize = UserPlayerList::LEN
        + LineupList::LEN
        + SwapProposalsList::LEN
        + TEAM_NAME_LEN
        + PUB_KEY_LEN
        + 1
        + 1;
    fn slice<'b>(
        &self,
        data: &'b mut [u8],
    ) -> (
        &'b mut [u8; UserPlayerList::LEN],
        &'b mut [u8; LineupList::LEN],
        &'b mut [u8; SwapProposalsList::LEN],
        &'b mut [u8; TEAM_NAME_LEN],
        &'b mut [u8; PUB_KEY_LEN],
        &'b mut [u8; 1],
        &'b mut [u8; 1],
    ) {
        mut_array_refs![
            array_mut_ref![data, self.offset, UserState::LEN],
            UserPlayerList::LEN,
            LineupList::LEN,
            SwapProposalsList::LEN,
            TEAM_NAME_LEN,
            PUB_KEY_LEN,
            1,
            1
        ]
    }

    pub fn get_user_players(&self) -> Result<UserPlayerList<'a>, ProgramError> {
        UserPlayerList::new(self.data, self.offset)
    }

    pub fn get_lineups(&self) -> Result<LineupList<'a>, ProgramError> {
        LineupList::new(self.data, self.offset + UserPlayerList::LEN)
    }

    pub fn get_swap_proposals(&self) -> Result<SwapProposalsList<'a>, ProgramError> {
        SwapProposalsList::new(
            self.data,
            self.offset + UserPlayerList::LEN + LineupList::LEN,
        )
    }

    pub fn get_team_name(&self) -> [u8; TEAM_NAME_LEN] {
        *self.slice(&mut self.data.borrow_mut()).3
    }
    pub fn set_team_name(&self, value: &[u8; TEAM_NAME_LEN]) {
        self.slice(&mut self.data.borrow_mut())
            .3
            .copy_from_slice(value);
    }

    pub fn get_pub_key(&self) -> Pubkey {
        Pubkey::new_from_array(*self.slice(&mut self.data.borrow_mut()).4)
    }
    pub fn set_pub_key(&self, value: Pubkey) {
        self.slice(&mut self.data.borrow_mut())
            .4
            .copy_from_slice(value.as_ref());
    }

    pub fn get_is_lineup_set(&self) -> Result<bool, ProgramError> {
        unpack_bool(self.slice(&mut self.data.borrow_mut()).5)
    }
    pub fn set_is_lineup_set(&self, value: bool) {
        self.slice(&mut self.data.borrow_mut()).5[0] = value as u8;
    }

    pub fn get_is_initialized(&self) -> Result<bool, ProgramError> {
        unpack_bool(self.slice(&mut self.data.borrow_mut()).6)
    }
    pub fn set_is_initialized(&self, value: bool) {
        self.slice(&mut self.data.borrow_mut()).6[0] = value as u8;
    }

    pub fn copy_to(&self, to: &Self) {
        let mut dst = to.data.borrow_mut();
        let mut src = self.data.borrow_mut();
        array_mut_ref![dst, to.offset, UserState::LEN].copy_from_slice(array_mut_ref![
            src,
            self.offset,
            UserState::LEN
        ]);
    }

    pub fn new(data: &'a RefCell<&'a mut [u8]>, offset: usize) -> Result<UserState, ProgramError> {
        if data.borrow().len() < Self::LEN + offset {
            return Err(ProgramError::InvalidAccountData);
        }
        Ok(UserState { data, offset })
    }
}

// Pull in syscall stubs when building for non-BPF targets
#[cfg(not(target_arch = "bpf"))]
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
