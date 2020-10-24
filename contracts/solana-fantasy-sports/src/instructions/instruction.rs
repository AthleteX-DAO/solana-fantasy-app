//! State transition types

use crate::{
    error::SfsError,
    instructions::*,
};
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
    InitializeRoot { args: InitializeRootArgs<'a> },
    UpdateLineup,
    /// Test
    ///
    /// Accounts expected by this instruction:
    ///
    ///   0. `[writable]`  The root account.
    ///   1. `[]` The latest state account.
    TestMutate,
}
impl<'a> InstructionType<'a> {
    pub fn unpack(input: &'a RefCell::<&'a [u8]>) -> Result<InstructionType, ProgramError> {
        let (&tag, rest) = input.borrow().split_first().ok_or(SfsError::InvalidInstruction)?;

        Ok(match tag {
            1 => {
                Self::InitializeRoot {
                    args: InitializeRootArgs { data: input, offset: 1 }
                }
            },

            _ => return Err(SfsError::InvalidInstruction.into()),
        })
    }
}
