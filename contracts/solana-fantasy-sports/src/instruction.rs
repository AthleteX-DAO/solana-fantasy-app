//! Instruction types

use crate::{
    error::SfsError,
    state::{
        PackNext,
        lists::{PlayerList, ActivePlayersList},
        consts::PUB_KEY_LEN
    }
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
        oracle_authority: Pubkey,
        players: PlayerList
    },
    UpdateLineup {
        league: u8,
        week: u8,
        lineup: ActivePlayersList
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
                let (oracle_authority, _rest) = Self::unpack_pubkey(rest)?;
                let (players, __rest) = PlayerList::unpack_next(_rest)?;
                Self::InitializeRoot {
                    oracle_authority,
                    players
                }
            },
            1 => {
                let (league, _rest) = Self::unpack_u8(rest)?;
                let (week, __rest) = Self::unpack_u8(_rest)?;
                let (lineup, ___rest) = ActivePlayersList::unpack_next(__rest)?;
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
                Self::pack_pubkey(oracle_authority, &mut buf);
                PlayerList::pack_next(players, &mut buf);
            }
            &Self::UpdateLineup {
                ref league,
                ref week,
                ref lineup
            } => {
                buf.push(1);
                // @TODO: add something here
            }
            Self::TestMutate => buf.push(2),
        };
        buf
    }

    fn unpack_pubkey(input: &[u8]) -> Result<(Pubkey, &[u8]), ProgramError> {
        if input.len() >= PUB_KEY_LEN {
            let (key, rest) = input.split_at(PUB_KEY_LEN);
            let pk = Pubkey::new(key);
            Ok((pk, rest))
        } else {
            Err(SfsError::InvalidInstruction.into())
        }
    }

    fn pack_pubkey(value: &Pubkey, buf: &mut Vec<u8>) {
        buf.extend_from_slice(&value.to_bytes());
    }

    fn unpack_pubkey_option(input: &[u8]) -> Result<(COption<Pubkey>, &[u8]), ProgramError> {
        match input.split_first() {
            Option::Some((&0, rest)) => Ok((COption::None, rest)),
            Option::Some((&1, rest)) if rest.len() >= PUB_KEY_LEN => {
                let (key, rest) = rest.split_at(PUB_KEY_LEN);
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
    oracle_authority_pubkey: &Pubkey,
    players: PlayerList
) -> Result<Instruction, ProgramError> {
    let data = SfsInstruction::InitializeRoot {
        oracle_authority: *oracle_authority_pubkey,
        players
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
            oracle_authority: Pubkey::new(&[3u8; 32]),
            players: PlayerList::default()
        };
        let packed = check.pack();
        let mut expect = vec![0u8];
        expect.extend_from_slice(&[3u8; 32]);
        expect.extend_from_slice(&[0u8; PlayerList::LEN]);
        assert_eq!(packed, expect);
        let unpacked = SfsInstruction::unpack(&expect).unwrap();
        assert_eq!(unpacked, check);

        let check = SfsInstruction::TestMutate;
        let packed = check.pack();
        let expect = Vec::from([2u8]);
        assert_eq!(packed, expect);
        let unpacked = SfsInstruction::unpack(&expect).unwrap();
        assert_eq!(unpacked, check);
    }
}
