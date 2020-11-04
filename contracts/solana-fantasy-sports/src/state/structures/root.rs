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
pub struct Root<'a> {
    data: &'a RefCell<&'a mut [u8]>,
    offset: usize,
}
impl<'a> Root<'a> {
    pub const LEN: usize =
        PlayerList::LEN + LeagueList::LEN + PickOrderList::LEN + 1 + 1 + PUB_KEY_LEN;
    fn slice<'b>(
        &self,
        data: &'b mut [u8],
    ) -> (
        &'b mut [u8; PlayerList::LEN],
        &'b mut [u8; LeagueList::LEN],
        &'b mut [u8; PickOrderList::LEN],
        &'b mut [u8; 1],
        &'b mut [u8; 1],
        &'b mut [u8; PUB_KEY_LEN],
    ) {
        mut_array_refs![
            array_mut_ref![data, self.offset, Root::LEN],
            PlayerList::LEN,
            LeagueList::LEN,
            PickOrderList::LEN,
            1,
            1,
            PUB_KEY_LEN
        ]
    }

    pub fn get_players(&self) -> Result<PlayerList<'a>, ProgramError> {
        PlayerList::new(self.data, self.offset)
    }

    pub fn get_leagues(&self) -> Result<LeagueList<'a>, ProgramError> {
        LeagueList::new(self.data, self.offset + PlayerList::LEN)
    }

    pub fn get_pick_order(&self) -> Result<PickOrderList<'a>, ProgramError> {
        PickOrderList::new(self.data, self.offset + PlayerList::LEN + LeagueList::LEN)
    }

    pub fn get_stage(&self) -> Result<Stage, ProgramError> {
        let stage = match self.slice(&mut self.data.borrow_mut()).3 {
            [0] => Stage::Uninitialized,
            [1] => Stage::SeasonOpen,
            [2] => Stage::SeasonComplete,
            _ => return Err(ProgramError::InvalidAccountData),
        };
        return Ok(stage);
    }
    pub fn set_stage(&self, value: Stage) {
        self.slice(&mut self.data.borrow_mut()).3[0] = value as u8;
    }

    pub fn get_current_week(&self) -> u8 {
        self.slice(&mut self.data.borrow_mut()).4[0]
    }
    pub fn set_current_week(&self, value: u8) {
        self.slice(&mut self.data.borrow_mut()).4[0] = value;
    }

    pub fn get_oracle_authority(&self) -> Pubkey {
        Pubkey::new_from_array(*self.slice(&mut self.data.borrow_mut()).5)
    }
    pub fn set_oracle_authority(&self, value: Pubkey) {
        self.slice(&mut self.data.borrow_mut())
            .5
            .copy_from_slice(value.as_ref());
    }

    pub fn copy_to(&self, to: &Self) {
        let mut dst = to.data.borrow_mut();
        let mut src = self.data.borrow_mut();
        array_mut_ref![dst, to.offset, Root::LEN].copy_from_slice(array_mut_ref![
            src,
            self.offset,
            Root::LEN
        ]);
    }

    pub fn new(data: &'a RefCell<&'a mut [u8]>) -> Result<Root, ProgramError> {
        if data.borrow().len() != Self::LEN {
            return Err(ProgramError::InvalidAccountData);
        }
        Ok(Root { data, offset: 0 })
    }
}

// Pull in syscall stubs when building for non-BPF targets
#[cfg(not(target_arch = "bpf"))]

#[cfg(test)]
mod tests {
    use super::*;

    // #[test]
    // fn test_pack_unpack() {
    //     let check = Root {
    //         oracle_authority: Pubkey::new(&[1; PUB_KEY_LEN]),
    //         players: PlayerList::default(),
    //         leagues: LeagueList::default(),
    //         is_initialized: true,
    //     };
    //     let mut packed = vec![0; Root::get_packed_len() + 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         Root::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; Root::get_packed_len() - 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         Root::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; Root::get_packed_len()];
    //     Root::pack(check.clone(), &mut packed).unwrap();
    //     let mut expect = vec![0u8; 0];
    //     expect.extend_from_slice(&[1u8; 32]);
    //     expect.extend_from_slice(&[0u8; PlayerList::LEN]);
    //     expect.extend_from_slice(&[0u8; LeagueList::LEN]);
    //     expect.extend_from_slice(&[1u8]);
    //     assert_eq!(packed, expect);
    //     let unpacked = Root::unpack_unchecked(&packed).unwrap();
    //     assert_eq!(unpacked, check);

    //     let size = Root::get_packed_len();
    //     assert!(size < 100, "too large size, {} bytes", size);
    //     let size = std::mem::size_of::<Root>();
    //     assert!(size < 100, "too large size, {} bytes", size);
    // }
}
