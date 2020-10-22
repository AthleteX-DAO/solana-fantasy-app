//! Instruction types

use crate::{
    error::SfsError, 
    state::{Player, TOTAL_PLAYERS_COUNT, ACTIVE_PLAYERS_COUNT}
};
use arrayref::{array_ref};
use solana_sdk::{
    instruction::{AccountMeta, Instruction},
    program_error::ProgramError,
    program_option::COption,
    program_pack::{IsInitialized, Pack, Sealed},
    pubkey::Pubkey,
    sysvar,
};
use byteorder::{ByteOrder, LittleEndian};
use std::convert::TryInto;
use std::mem::size_of;

/// Instructions supported by the token program.
#[repr(C)]
#[derive(Clone, Debug, PartialEq)]
pub enum SfsInstruction {
    /// Initializes a new root.
    ///
    /// The `InitializeRoot` instruction requires no signers and MUST be included within
    /// the same Transaction as the system program's `CreateInstruction` that creates the account
    /// being initialized.  Otherwise another party can acquire ownership of the uninitialized account.
    ///
    /// Accounts expected by this instruction:
    ///
    ///   0. `[writable]` The root to initialize.
    ///   1. `[]` Rent sysvar
    ///
    InitializeRoot {
        /// The authority/multisignature to supply game scores.
        oracle_authority: COption<Pubkey>,
        players: [Player; TOTAL_PLAYERS_COUNT]
    },
    UpdateLineup {
        league: u8,
        week: u8,
        lineup: [u16; ACTIVE_PLAYERS_COUNT]
    },
    /// Test
    ///
    /// Accounts expected by this instruction:
    ///
    ///   0. `[writable]`  The root account.
    ///   1. `[]` The latest state account.
    TestMutate,
}
impl SfsInstruction {
    /// Unpacks a byte buffer into a [SfsInstruction](enum.SfsInstruction.html).
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (&tag, rest) = input.split_first().ok_or(SfsError::InvalidInstruction)?;
        Ok(match tag {
            0 => {
                let (oracle_authority, _rest) = Self::unpack_pubkey_option(rest)?;
                let (players, __rest) = Self::unpack_players(_rest)?;
                Self::InitializeRoot {
                    oracle_authority,
                    players
                }
            },
            1 => {
                let (league, _rest) = Self::unpack_u8(rest)?;
                let (week, __rest) = Self::unpack_u8(_rest)?;
                let (lineup, ___rest) = Self::unpack_lineup(__rest)?;
                Self::UpdateLineup {
                    league,
                    week,
                    lineup
                }
            }
            2 => Self::TestMutate,

            _ => return Err(SfsError::InvalidInstruction.into()),
        })
    }

    /// Packs a [SfsInstruction](enum.SfsInstruction.html) into a byte buffer.
    pub fn pack(&self) -> Vec<u8> {
        let mut buf = Vec::with_capacity(size_of::<Self>());
        match self {
            &Self::InitializeRoot {
                ref oracle_authority,
                ref players
            } => {
                buf.push(0);
                Self::pack_pubkey_option(oracle_authority, &mut buf);
                Self::pack_players(players, &mut buf)
            }
            &Self::UpdateLineup {
                ref league,
                ref week,
                ref lineup
            } => {
                // @TODO: add something here
            }
            Self::TestMutate => buf.push(1),
        };
        buf
    }

    fn unpack_pubkey(input: &[u8]) -> Result<(Pubkey, &[u8]), ProgramError> {
        if input.len() >= 32 {
            let (key, rest) = input.split_at(32);
            let pk = Pubkey::new(key);
            Ok((pk, rest))
        } else {
            Err(SfsError::InvalidInstruction.into())
        }
    }

    fn unpack_pubkey_option(input: &[u8]) -> Result<(COption<Pubkey>, &[u8]), ProgramError> {
        match input.split_first() {
            Option::Some((&0, rest)) => Ok((COption::None, rest)),
            Option::Some((&1, rest)) if rest.len() >= 32 => {
                let (key, rest) = rest.split_at(32);
                let pk = Pubkey::new(key);
                Ok((COption::Some(pk), rest))
            }
            _ => Err(SfsError::InvalidInstruction.into()),
        }
    }

    fn pack_pubkey_option(value: &COption<Pubkey>, buf: &mut Vec<u8>) {
        match *value {
            COption::Some(ref key) => {
                buf.push(1);
                buf.extend_from_slice(&key.to_bytes());
            }
            COption::None => buf.push(0),
        }
    }

    fn unpack_players(input: &[u8]) -> Result<([Player; TOTAL_PLAYERS_COUNT], &[u8]), ProgramError> {
        if input.len() >= Player::LEN * TOTAL_PLAYERS_COUNT {
            let mut players = [Player::default(); TOTAL_PLAYERS_COUNT];
            let (_input, rest) = input.split_at(Player::LEN * TOTAL_PLAYERS_COUNT);
            for i in 0..TOTAL_PLAYERS_COUNT {
                let player_src = array_ref!(_input, i * Player::LEN, Player::LEN);
                players[i] = Player::unpack_from_slice(player_src).unwrap();
            }
            return Ok((players, rest));
        } else {
            Err(SfsError::InvalidInstruction.into())
        }
    }

    fn pack_players(value: &[Player; TOTAL_PLAYERS_COUNT], buf: &mut Vec<u8>) {
        for i in 0..TOTAL_PLAYERS_COUNT {
            let mut player_dst = [0u8; Player::LEN];
            Player::pack_into_slice(&value[i], &mut player_dst);
            buf.extend_from_slice(&player_dst);
        }
    }
    
    fn unpack_lineup(value: &[u8]) -> Result<([u16; ACTIVE_PLAYERS_COUNT], &[u8]), ProgramError> {
        let mut lineup = [u16::default(); ACTIVE_PLAYERS_COUNT];
        let (_value, rest) = value.split_at(2 * ACTIVE_PLAYERS_COUNT);
        for i in 0..ACTIVE_PLAYERS_COUNT {
            let lineup_src = array_ref!(_value, i * 2, 2);
            // lineup[i] = Player::unpack_from_slice(player_src).unwrap();
            lineup[i] = LittleEndian::read_u16(lineup_src);
        }
        return Ok((lineup, rest));
    }

    fn unpack_u8(input: &[u8]) -> Result<(u8, &[u8]), ProgramError> {
        if input.len() >= 1 {
            let (num, rest) = input.split_at(1);
            Ok((u8::from_le_bytes(num.try_into().unwrap()), rest))
        } else {
            Err(SfsError::InvalidInstruction.into())
        }
    }
}

/// Creates a `InitializeRoot` instruction.
pub fn initialize_root(
    sfs_program_id: &Pubkey,
    root_pubkey: &Pubkey,
    oracle_authority_pubkey: Option<&Pubkey>,
    players: &[Player; TOTAL_PLAYERS_COUNT]
) -> Result<Instruction, ProgramError> {
    let oracle_authority = oracle_authority_pubkey.cloned().into();
    let data = SfsInstruction::InitializeRoot {
        oracle_authority,
        players: *players
    }
    .pack();

    let accounts = vec![
        AccountMeta::new(*root_pubkey, false),
        AccountMeta::new_readonly(sysvar::rent::id(), false),
    ];

    Ok(Instruction {
        program_id: *sfs_program_id,
        accounts,
        data,
    })
}

/// Creates a `TestMutate` instruction.
pub fn test_mutate(
    sfs_program_id: &Pubkey,
    root_pubkey: &Pubkey,
) -> Result<Instruction, ProgramError> {
    let data = SfsInstruction::TestMutate.pack(); // TODO do we need to return result?

    let accounts = vec![
        AccountMeta::new(*root_pubkey, false),
    ];

    Ok(Instruction {
        program_id: *sfs_program_id,
        accounts,
        data,
    })
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_instruction_packing() {
        let check = SfsInstruction::InitializeRoot {
            oracle_authority: COption::Some(Pubkey::new(&[3u8; 32])),
            players: [Player::default(); TOTAL_PLAYERS_COUNT]
        };
        let packed = check.pack();
        let mut expect = vec![0u8, 1];
        expect.extend_from_slice(&[3u8; 32]);
        expect.extend_from_slice(&[0u8; Player::LEN * TOTAL_PLAYERS_COUNT]);
        assert_eq!(packed, expect);
        let unpacked = SfsInstruction::unpack(&expect).unwrap();
        assert_eq!(unpacked, check);

        let check = SfsInstruction::TestMutate;
        let packed = check.pack();
        let expect = Vec::from([1u8]);
        assert_eq!(packed, expect);
        let unpacked = SfsInstruction::unpack(&expect).unwrap();
        assert_eq!(unpacked, check);
    }
}
