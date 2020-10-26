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
    AddPlayers {
        args: AddPlayersArgs<'a>,
    },
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
    StartDraftSelection {
        args: StartDraftSelectionArgs<'a>,
    },
    StartSeason,
    // CompleteSeason,
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
    PickPlayer {
        args: PickPlayerArgs<'a>,
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
            1 => Self::AddPlayers {
                args: AddPlayersArgs {
                    data: input,
                    offset: 1,
                },
            },
            2 => Self::InitializeRoot {
                args: InitializeRootArgs {
                    data: input,
                    offset: 1,
                },
            },
            3 => Self::StartDraftSelection {
                args: StartDraftSelectionArgs {
                    data: input,
                    offset: 1,
                },
            },
            4 => Self::StartSeason,

            5 => Self::PickPlayer {
                args: PickPlayerArgs {
                    data: input,
                    offset: 1,
                },
            },
            6 => Self::ProposeSwap {
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
            Self::AddPlayers { args } => {
                buf.push(1);
                buf.extend_from_slice(&[0u8; AddPlayersArgs::LEN]);
                args.copy_to(array_mut_ref![buf, 1, AddPlayersArgs::LEN]);
            }
            Self::InitializeRoot { args } => {
                buf.push(2);
                buf.extend_from_slice(&[0u8; InitializeRootArgs::LEN]);
                args.copy_to(array_mut_ref![buf, 1, InitializeRootArgs::LEN]);
            }
            Self::StartDraftSelection { args } => {
                buf.push(3);
                buf.extend_from_slice(&[0u8; StartDraftSelectionArgs::LEN]);
                args.copy_to(array_mut_ref![buf, 1, StartDraftSelectionArgs::LEN]);
            }
            Self::StartSeason => {
                buf.push(4);
            }

            Self::PickPlayer { args } => {
                buf.push(5);
                buf.extend_from_slice(&[0u8; PickPlayerArgs::LEN]);
                args.copy_to(array_mut_ref![buf, 1, PickPlayerArgs::LEN]);
            }
            Self::ProposeSwap { args } => {
                buf.push(6);
                buf.extend_from_slice(&[0u8; ProposeSwapArgs::LEN]);
                args.copy_to(array_mut_ref![buf, 1, ProposeSwapArgs::LEN]);
            }

            Self::UpdateLineup => {
                buf.push(7);
            }
            Self::TestMutate => {
                buf.push(8);
            }
        };
        buf
    }
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

/// Creates a `StartDraftSelection` instruction.
pub fn start_draft_selection(
    sfs_program_id: &Pubkey,
    root_pubkey: &Pubkey,
    args: StartDraftSelectionArgs,
) -> Result<Instruction, ProgramError> {
    let data = SfsInstruction::StartDraftSelection { args }.pack();

    let accounts = vec![AccountMeta::new(*root_pubkey, false)];

    Ok(Instruction {
        program_id: *sfs_program_id,
        accounts,
        data,
    })
}

/// Creates a `StartSeason` instruction.
pub fn start_season(
    sfs_program_id: &Pubkey,
    root_pubkey: &Pubkey,
) -> Result<Instruction, ProgramError> {
    let data = SfsInstruction::StartSeason.pack();

    let accounts = vec![AccountMeta::new(*root_pubkey, false)];

    Ok(Instruction {
        program_id: *sfs_program_id,
        accounts,
        data,
    })
}

/// Creates a `PickPlayer` instruction.
pub fn pick_player(
    sfs_program_id: &Pubkey,
    root_pubkey: &Pubkey,
    args: PickPlayerArgs,
) -> Result<Instruction, ProgramError> {
    let data = SfsInstruction::PickPlayer { args }.pack();

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
