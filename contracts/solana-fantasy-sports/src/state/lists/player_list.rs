//! State transition types
#![cfg(feature = "program")]

use crate::error::SfsError;
use crate::state::*;
use arrayref::{array_mut_ref, array_ref, mut_array_refs};
use byteorder::{ByteOrder, LittleEndian};
use solana_sdk::{
    info,
    program_error::ProgramError,
    program_pack::{Pack, Sealed},
};
use std::cell::RefCell;
use user_player_list::UserPlayerList;

#[repr(C)]
pub struct PlayerList<'a> {
    data: &'a RefCell<&'a mut [u8]>,
    offset: usize,
}
impl<'a> PlayerList<'a> {
    pub const ITEM_SIZE: usize = Player::LEN;
    pub const ITEM_CAPACITY: u16 = consts::PLAYERS_CAPACITY;
    pub const LEN: usize = 2 + PlayerList::ITEM_SIZE * PlayerList::ITEM_CAPACITY as usize;
    fn slice<'b>(
        &self,
        data: &'b mut [u8],
    ) -> (
        &'b mut [u8; 2],
        &'b mut [u8; PlayerList::ITEM_SIZE * PlayerList::ITEM_CAPACITY as usize],
    ) {
        mut_array_refs![
            array_mut_ref![data, self.offset, PlayerList::LEN],
            2,
            PlayerList::ITEM_SIZE * PlayerList::ITEM_CAPACITY as usize
        ]
    }

    pub fn get_count(&self) -> u16 {
        LittleEndian::read_u16(self.slice(&mut self.data.borrow_mut()).0)
    }
    fn set_count(&self, value: u16) {
        LittleEndian::write_u16(self.slice(&mut self.data.borrow_mut()).0, value);
    }

    pub fn get(&self, i: u16) -> Result<Player<'a>, ProgramError> {
        if i >= self.get_count() {
            return Err(SfsError::IndexOutOfRange.into());
        }
        Player::new(
            self.data,
            self.offset + 2 + i as usize * PlayerList::ITEM_SIZE,
        )
    }

    pub fn get_by_id(&self, id: u16) -> Result<Player<'a>, ProgramError> {
        for i in 0..PlayerList::LEN {
            let player = self.get(i as u16)?;
            if player.get_external_id() == id {
                return Ok(player);
            }
        }
        info!("User does not exist");
        Err(SfsError::ItemNotFound.into())
    }

    pub fn ensure_list_valid_after_set(
        &self,
        user_player_list: UserPlayerList<'a>,
        set_index: u8,
        player_id: u16,
    ) -> Result<(), ProgramError> {
        let mut qb_count = 0; // max 4
        let mut rb_count = 0; // max 8
        let mut wr_count = 0; // max 8
        let mut te_count = 0; // max 3
        let mut k_count = 0; // max 3
        let mut d_count = 0; // max 3
        for i in 0..UserPlayerList::LEN {
            let id = if set_index != std::u8::MAX && i as u8 == set_index {
                player_id
            } else {
                user_player_list.get(i as u8)
            };

            match self.get_by_id(id)?.get_position()? {
                Position::RB => {
                    rb_count += 1;
                }
                // LB => {},
                // DL => {},
                Position::TE => {
                    te_count += 1;
                }
                // DB => {},
                Position::QB => {
                    qb_count += 1;
                }
                Position::WR => {
                    wr_count += 1;
                }
                // OL => {},
                _ => {}
            }
        }

        if qb_count > 4 {
            info!("There was error: QB are becomming more than 4");
            return Err(SfsError::TeamCompositionRulesViolation.into());
        }
        if rb_count > 8 {
            info!("There was error: RB are becomming more than 8");
            return Err(SfsError::TeamCompositionRulesViolation.into());
        }
        if wr_count > 8 {
            info!("There was error: WR are becomming more than 8");
            return Err(SfsError::TeamCompositionRulesViolation.into());
        }
        if te_count > 3 {
            info!("There was error: TE are becomming more than 3");
            return Err(SfsError::TeamCompositionRulesViolation.into());
        }
        if k_count > 3 {
            info!("There was error: K are becomming more than 3");
            return Err(SfsError::TeamCompositionRulesViolation.into());
        }
        if d_count > 3 {
            info!("There was error: D are becomming more than 3");
            return Err(SfsError::TeamCompositionRulesViolation.into());
        }

        return Ok(());
    }

    pub fn add(&self, external_id: u16, position: Position) -> Result<(), ProgramError> {
        if self.get_count() >= PlayerList::ITEM_CAPACITY {
            return Err(SfsError::OutOfCapacity.into());
        }
        self.set_count(self.get_count() + 1);
        let player = self.get(self.get_count() - 1)?;
        player.set_external_id(external_id);
        player.set_position(position);
        player.set_is_initialized(true);
        Ok(())
    }

    pub fn copy_to(&self, to: &Self) {
        let mut dst = to.data.borrow_mut();
        let mut src = self.data.borrow_mut();
        array_mut_ref![dst, self.offset, PlayerList::LEN].copy_from_slice(array_mut_ref![
            src,
            self.offset,
            PlayerList::LEN
        ]);
    }

    pub fn new(data: &'a RefCell<&'a mut [u8]>, offset: usize) -> Result<PlayerList, ProgramError> {
        if data.borrow().len() < Self::LEN + offset {
            return Err(ProgramError::InvalidAccountData);
        }
        Ok(PlayerList { data, offset })
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
    //     let check = PlayerList {
    //         list: [Player::default(); ITEM_COUNT],
    //     };
    //     let mut packed = vec![0; PlayerList::get_packed_len() + 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         PlayerList::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; PlayerList::get_packed_len() - 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         PlayerList::pack(check.clone(), &mut packed)
    //     );
    //     let mut packed = vec![0; PlayerList::get_packed_len()];
    //     PlayerList::pack(check.clone(), &mut packed).unwrap();
    //     let expect = vec![0u8; ITEM_SIZE * ITEM_COUNT];
    //     assert_eq!(packed, expect);
    //     let unpacked = PlayerList::unpack_unchecked(&packed).unwrap();
    //     assert_eq!(unpacked, check);

    //     let size = PlayerList::get_packed_len();
    //     assert!(size < 100, "too large size, {} bytes", size);
    //     let size = std::mem::size_of::<PlayerList>();
    //     assert!(size < 100, "too large size, {} bytes", size);
    // }
}
