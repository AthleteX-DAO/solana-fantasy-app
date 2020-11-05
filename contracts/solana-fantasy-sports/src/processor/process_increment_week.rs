//! Program state processor

use crate::{
  error::SfsError,
  instructions,
  instructions::{arguments::*, instruction::*},
  processor::helpers,
  state::*,
};
use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};
use num_traits::FromPrimitive;
use solana_program::program::invoke;
use solana_program::program::invoke_signed;
use solana_program::{
  account_info::{next_account_info, AccountInfo},
  decode_error::DecodeError,
  entrypoint::ProgramResult,
  info,
  instruction::{AccountMeta, Instruction},
  program_error::{PrintProgramError, ProgramError},
  program_option::COption,
  program_pack::{IsInitialized, Pack},
  pubkey::Pubkey,
  system_instruction::SystemInstruction,
  sysvar::{rent::Rent, Sysvar},
};
use std::cell::RefCell;
use std::convert::TryInto;

/// Processes an [IncrementWeek](enum.SfsInstruction.html) instruction.
pub fn process_increment_week<'a>(
  program_id: &Pubkey,
  accounts: &'a [AccountInfo<'a>],
) -> ProgramResult {
  let account_info_iter = &mut accounts.iter();
  let root_info = next_account_info(account_info_iter)?;
  let root = Root::new(&root_info.data)?;
  let user_account_info = next_account_info(account_info_iter)?;

  helpers::validate_owner(program_id, &root.get_oracle_authority(), user_account_info)?;

  let current_week = root.get_current_week();

  if current_week > GAMES_COUNT {
    return Err(SfsError::InvalidState.into());
  }

  root.set_current_week(current_week + 1);

  Ok(())
}
