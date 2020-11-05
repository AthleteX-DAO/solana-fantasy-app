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
  system_instruction::{transfer, SystemInstruction},
  sysvar::{rent::Rent, Sysvar},
};
use std::cell::RefCell;
use std::convert::TryInto;

/// Processes an [ClaimReward](enum.SfsInstruction.html) instruction.
pub fn process_claim_reward<'a>(
  program_id: &Pubkey,
  accounts: &'a [AccountInfo<'a>],
  args: ClaimRewardArgs,
) -> ProgramResult {
  let account_info_iter = &mut accounts.iter();
  let root_info = next_account_info(account_info_iter)?;
  let root = Root::new(&root_info.data)?;

  let current_week = root.get_current_week();

  if current_week != GAMES_COUNT + 1 {
    return Err(SfsError::InvalidState.into());
  }

  let league = root.get_leagues()?.get(args.get_league_index())?;
  if league.get_is_reward_claimed()? {
    return Err(SfsError::InvalidState.into());
  }

  let players = root.get_players()?;
  let mut winners = Vec::<u8>::new();
  let mut winner_score = 0;

  let user_states = league.get_user_states()?;
  for user_id in 1..user_states.get_count() + 1 {
    let lineups = user_states.get_by_id(user_id)?.get_lineups()?;
    let mut user_score = 0;
    for week in league.get_start_week()..GAMES_COUNT + 1 {
      let lineup = lineups.get_by_week(week)?;
      for i in 0..ActivePlayersList::ITEM_COUNT {
        user_score += players
          .get_by_id(lineup.get(i))?
          .get_scores()?
          .get_by_week(week)?
          .get_score1();
      }
    }
    if user_score > winner_score {
      winners.clear();
      winners.push(user_id);
      winner_score = user_score;
    } else if user_score == winner_score {
      winners.push(user_id);
    }
  }

  let bank_account_info = next_account_info(account_info_iter)?;
  let system_program_account_info = next_account_info(account_info_iter)?;
  helpers::validate_bank(program_id, bank_account_info)?;

  let (bank_pubkey, bump_seed) = Pubkey::find_program_address(&[&[0]], program_id);

  let reward = league.get_bid() / winners.len() as u64;
  for i in 0..winners.len() {
    let user_account_info = next_account_info(account_info_iter)?;
    if user_states.get_by_id(winners[i])?.get_pub_key() != *user_account_info.key {
      return Err(SfsError::InvalidInstruction.into());
    }
    let instruction = transfer(bank_account_info.key, user_account_info.key, reward);
    let accounts = [
      bank_account_info.clone(),
      user_account_info.clone(),
      system_program_account_info.clone(),
    ];
    invoke_signed(&instruction, &accounts, &[&[&[0, bump_seed]]])?;
  }

  league.set_is_reward_claimed(true);
  Ok(())
}
