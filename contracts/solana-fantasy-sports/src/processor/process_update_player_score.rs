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

pub fn process_update_player_score<'a>(
  program_id: &Pubkey,
  accounts: &'a [AccountInfo<'a>],
  args: UpdatePlayerScoreArgs,
) -> ProgramResult {
  let account_info_iter = &mut accounts.iter();
  let root_info = next_account_info(account_info_iter)?;
  let root = Root::new(&root_info.data)?;

  // add a check that only owner can call

  let score = root.get_players()?.get(args.get_player_id())?.get_scores()?.get(root.get_current_week() - 1)?;
  if(score.get_score1() != 0) {
    return Err(SfsError::ScoreAlreadyUpdated.into());
  }

  score.set_score1(args.get_player_score());

  Ok(())
}