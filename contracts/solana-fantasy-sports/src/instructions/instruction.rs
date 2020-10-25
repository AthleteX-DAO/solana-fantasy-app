//! State transition types

use crate::{error::SfsError, instructions::*};
use arrayref::{array_mut_ref, array_ref};
use byteorder::{ByteOrder, LittleEndian};
use solana_sdk::{
    instruction::{AccountMeta, Instruction},
    program_error::ProgramError,
    program_option::COption,
    program_pack::{IsInitialized, Pack, Sealed},
    pubkey::Pubkey,
    sysvar,
};
use std::cell::RefCell;
use std::convert::TryInto;
use std::mem::size_of;

/// Instructions supported by the token program.
#[repr(C)]
pub enum SfsInstruction<'a> {
    /// Not yet initialized
    Uninitialized,
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
        args: InitializeRootArgs<'a>,
    },
    AddPlayers {
        args: AddPlayersArgs<'a>,
    },
    ///
    /// Updates lineup of a user
    ///
    /// Accounts expected by this instruction:
    ///   0. `[user address]` // check if this is correct
    ///
    UpdateLineup,
    ///
    /// Adds a swap proposal
    ///
    /// Accounts expected by this instruction:
    ///   0. `[writable]` The root to initialize.
    ///
    ProposeSwap {
        args: ProposeSwapArgs<'a>,
    },
    /// Test
    ///
    /// Accounts expected by this instruction:
    ///
    ///   0. `[writable]`  The root account.
    ///   1. `[]` The latest state account.
    TestMutate,
}
impl<'a> SfsInstruction<'a> {
    pub fn unpack(input: &'a RefCell<&'a [u8]>) -> Result<Self, ProgramError> {
        let (&tag, rest) = input
            .borrow()
            .split_first()
            .ok_or(SfsError::InvalidInstruction)?;

        Ok(match tag {
            1 => Self::InitializeRoot {
                args: InitializeRootArgs {
                    data: input,
                    offset: 1,
                },
            },
            2 => Self::AddPlayers {
                args: AddPlayersArgs {
                    data: input,
                    offset: 1,
                },
            },
            3 => Self::ProposeSwap {
                args: ProposeSwapArgs {
                    data: input,
                    offset: 1,
                },
            },

            _ => return Err(SfsError::InvalidInstruction.into()),
        })
    }

    /// Packs a [SfsInstruction](enum.SfsInstruction.html) into a byte buffer.
    pub fn pack(&self) -> Vec<u8> {
        let mut buf = Vec::new();
        match self {
            Self::Uninitialized => {
                buf.push(0);
            }
            Self::InitializeRoot { args } => {
                buf.push(1);
                buf.extend_from_slice(&[0u8; InitializeRootArgs::LEN]);
                args.copy_to(array_mut_ref![buf, 1, InitializeRootArgs::LEN]);
            }
            Self::AddPlayers { args } => {
                buf.push(2);
                buf.extend_from_slice(&[0u8; AddPlayersArgs::LEN]);
                args.copy_to(array_mut_ref![buf, 1, AddPlayersArgs::LEN]);
            }
            Self::ProposeSwap { args } => {
                buf.push(3);
                buf.extend_from_slice(&[0u8; ProposeSwapArgs::LEN]);
                args.copy_to(array_mut_ref![buf, 1, ProposeSwapArgs::LEN]);
            }
            Self::UpdateLineup => {
                buf.push(4);
            }
            Self::TestMutate => {
                buf.push(5);
            }
        };
        buf
    }
}

/// Creates a `InitializeRoot` instruction.
pub fn initialize_root(
    sfs_program_id: &Pubkey,
    root_pubkey: &Pubkey,
    args: InitializeRootArgs,
) -> Result<Instruction, ProgramError> {
    let data = SfsInstruction::InitializeRoot { args }.pack();

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

/// Creates a `AddPlayers` instruction.
pub fn add_players(
    sfs_program_id: &Pubkey,
    root_pubkey: &Pubkey,
    args: AddPlayersArgs,
) -> Result<Instruction, ProgramError> {
    let data = SfsInstruction::AddPlayers { args }.pack();

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

/// Creates a `ProposeSwap` instruction.
pub fn propose_swap(
    sfs_program_id: &Pubkey,
    root_pubkey: &Pubkey,
    args: ProposeSwapArgs,
) -> Result<Instruction, ProgramError> {
    let data = SfsInstruction::ProposeSwap { args }.pack();

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

#[cfg(test)]
mod test {
    use super::*;

    // #[test]
    // fn test_instruction_packing() {
    //     let check = SfsInstruction::InitializeRoot {
    //         oracle_authority: Pubkey::new(&[3u8; 32]),
    //         players: PlayerList::default()
    //     };
    //     let packed = check.pack();
    //     let mut expect = vec![0u8];
    //     expect.extend_from_slice(&[3u8; 32]);
    //     expect.extend_from_slice(&[0u8; PlayerList::LEN]);
    //     assert_eq!(packed, expect);
    //     let unpacked = SfsInstruction::unpack(&expect).unwrap();
    //     assert_eq!(unpacked, check);

    //     let size = packed.len();
    //     assert!(size < 100, "too large size, {} bytes", size);

    //     let check = SfsInstruction::TestMutate;
    //     let packed = check.pack();
    //     let expect = Vec::from([2u8]);
    //     assert_eq!(packed, expect);
    //     let unpacked = SfsInstruction::unpack(&expect).unwrap();
    //     assert_eq!(unpacked, check);

    //     let size = std::mem::size_of::<SfsInstruction>();
    //     assert!(size < 100, "too large size, {} bytes", size);
    // }
}
