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

/// Processes an [AddPlayers](enum.SfsInstruction.html) instruction.
pub fn process_pick_player<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    args: PickPlayerArgs,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let root_info = next_account_info(account_info_iter)?;
    let root = Root::new(&root_info.data)?;
    let user_account_info = next_account_info(account_info_iter)?;

    if root.get_stage()? != Stage::SeasonOpen {
        return Err(SfsError::InvalidStage.into());
    }

    if root.get_current_week() >= consts::GAMES_COUNT {
        return Err(SfsError::InvalidState.into());
    }

    let player_id = args.get_player_id();

    if player_id == 0 || player_id > root.get_players()?.get_count() {
        return Err(SfsError::IndexOutOfRange.into());
    }

    let league = root.get_leagues()?.get(args.get_league_index())?;
    let user_state = league.get_user_states()?.get_by_id(args.get_user_id())?;

    helpers::validate_owner(program_id, &user_state.get_pub_key(), user_account_info)?;

    let users_count = league.get_user_states()?.get_count();

    if users_count != league.get_users_limit() {
        return Err(SfsError::InvalidState.into());
    }

    let mut league_pick_order = Vec::<u8>::with_capacity(users_count as usize);
    for i in 0..PickOrderList::ITEM_COUNT {
        let pick = root.get_pick_order()?.get(i);
        if pick <= users_count {
            league_pick_order.push(pick);
            if league_pick_order.len() == users_count as usize {
                break;
            }
        }
    }

    let round = league.get_pick_round()?;
    if round >= TEAM_PLAYERS_COUNT {
        return Err(SfsError::InvalidState.into());
    }

    let mut pick_in_round = (league.get_current_pick() % users_count as u16) as u8;
    if round % 2 == 0 {
        pick_in_round = users_count - pick_in_round - 1;
    }
    let current_pick_user_id = league_pick_order[pick_in_round as usize];

    if args.get_user_id() != current_pick_user_id {
        return Err(SfsError::InvalidState.into());
    }

    for i in 1..users_count + 1 {
        let user_players = league.get_user_states()?.get_by_id(i)?.get_user_players()?;
        if user_players.contains(player_id) {
            return Err(SfsError::AlreadyInUse.into());
        }
    }

    user_state.get_user_players()?.set(round, player_id);
    league.set_current_pick(league.get_current_pick() + 1);

    Ok(())
}
