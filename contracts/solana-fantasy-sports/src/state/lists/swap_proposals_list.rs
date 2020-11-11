//! State transition types

use crate::error::SfsError;
use crate::state::*;
use arrayref::{array_mut_ref, array_ref, mut_array_refs};
use solana_program::{
    program_error::ProgramError,
    program_pack::{Pack, Sealed},
};
use std::cell::RefCell;
use std::ops::{Index, IndexMut};

#[repr(C)]
pub struct SwapProposalsList<'a> {
    data: &'a RefCell<&'a mut [u8]>,
    offset: usize,
}
impl<'a> SwapProposalsList<'a> {
    pub const ITEM_SIZE: usize = SwapProposal::LEN;
    pub const ITEM_CAPACITY: u8 = consts::SWAP_PROPOSALS_CAPACITY;
    pub const LEN: usize =
        1 + SwapProposalsList::ITEM_SIZE * SwapProposalsList::ITEM_CAPACITY as usize;
    fn slice<'b>(
        &self,
        data: &'b mut [u8],
    ) -> (
        &'b mut [u8; 1],
        &'b mut [u8; SwapProposalsList::ITEM_SIZE * SwapProposalsList::ITEM_CAPACITY as usize],
    ) {
        mut_array_refs![
            array_mut_ref![data, self.offset, SwapProposalsList::LEN],
            1,
            SwapProposalsList::ITEM_SIZE * SwapProposalsList::ITEM_CAPACITY as usize
        ]
    }

    pub fn get_count(&self) -> u8 {
        self.slice(&mut self.data.borrow_mut()).0[0]
    }
    fn set_count(&self, value: u8) {
        self.slice(&mut self.data.borrow_mut()).0[0] = value;
    }

    fn get(&self, i: u8) -> Result<SwapProposal<'a>, ProgramError> {
        if i >= self.get_count() {
            return Err(SfsError::IndexOutOfRange.into());
        }
        SwapProposal::new(
            self.data,
            self.offset + 1 + i as usize * SwapProposalsList::ITEM_SIZE,
        )
    }

    fn index_of(&self, give_player_id: u16, want_player_id: u16) -> Result<u8, ProgramError> {
        for i in 0..self.get_count() {
            let proposal = self.get(i)?;
            if proposal.get_give_player_id() == give_player_id
                && proposal.get_want_player_id() == want_player_id
            {
                return Ok(i as u8);
            }
        }

        return Err(SfsError::ItemNotFound.into());
    }

    pub fn contains(&self, give_player_id: u16, want_player_id: u16) -> bool {
        return self.index_of(give_player_id, want_player_id).is_ok();
    }

    pub fn add(&self, give_player_id: u16, want_player_id: u16) -> Result<(), ProgramError> {
        if self.get_count() >= SwapProposalsList::ITEM_CAPACITY {
            return Err(SfsError::OutOfCapacity.into());
        }
        if self.contains(give_player_id, want_player_id) {
            return Err(SfsError::AlreadyInUse.into());
        }
        self.set_count(self.get_count() + 1);
        let proposal = self.get(self.get_count() - 1)?;
        proposal.set_give_player_id(give_player_id);
        proposal.set_want_player_id(want_player_id);
        proposal.set_is_initialized(true);
        Ok(())
    }

    pub fn remove(&self, give_player_id: u16, want_player_id: u16) -> Result<(), ProgramError> {
        let proposal_index = self.index_of(give_player_id, want_player_id)?;
        for i in proposal_index..self.get_count() - 1 {
            let proposal = self.get(i)?;
            let next = self.get(i + 1)?;
            next.copy_to(&proposal)?;
        }
        let last = self.get(self.get_count() - 1)?;
        last.set_give_player_id(0);
        last.set_want_player_id(0);
        last.set_is_initialized(false);
        self.set_count(self.get_count() - 1);
        Ok(())
    }

    pub fn copy_to(&self, to: &Self) {
        let mut dst = to.data.borrow_mut();
        let mut src = self.data.borrow_mut();
        array_mut_ref![dst, to.offset, SwapProposalsList::LEN].copy_from_slice(array_mut_ref![
            src,
            self.offset,
            SwapProposalsList::LEN
        ]);
    }

    pub fn new(
        data: &'a RefCell<&'a mut [u8]>,
        offset: usize,
    ) -> Result<SwapProposalsList, ProgramError> {
        if data.borrow().len() < Self::LEN + offset {
            return Err(ProgramError::InvalidAccountData);
        }
        Ok(SwapProposalsList { data, offset })
    }
}

// Pull in syscall stubs when building for non-BPF targets
#[cfg(not(target_arch = "bpf"))]
#[cfg(test)]
mod tests {
    use super::*;

    // #[test]
    // fn test_pack_unpack() {
    //     let check = SwapProposalsList {
    //         list: vec![SwapProposal::default(); ITEM_COUNT],
    //     };
    //     let mut packed = vec![0; SwapProposalsList::get_packed_len() + 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         SwapProposalsList::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; SwapProposalsList::get_packed_len() - 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         SwapProposalsList::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; SwapProposalsList::get_packed_len()];
    //     SwapProposalsList::pack(check.clone(), &mut packed).unwrap();
    //     let expect = vec![0u8; ITEM_SIZE * ITEM_COUNT];
    //     assert_eq!(packed, expect);
    //     let unpacked = SwapProposalsList::unpack_unchecked(&packed).unwrap();
    //     assert_eq!(unpacked, check);
    // }
}
