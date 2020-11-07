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

pub fn process_update_lineup<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    args: UpdateLineupArgs,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let root_info = next_account_info(account_info_iter)?;
    let root = Root::new(&root_info.data)?;
    let user_account_info = next_account_info(account_info_iter)?;

    if root.get_stage()? != Stage::SeasonOpen {
        return Err(SfsError::InvalidStage.into());
    }

    let league = root.get_leagues()?.get(args.get_league_index())?;
    let user_states = league.get_user_states()?;
    let user_state = user_states.get_by_id(args.get_user_id())?;

    helpers::validate_owner(program_id, &user_state.get_pub_key(), user_account_info)?;

    let round = league.get_pick_round()?;

    // Checking if draft selection complete for this league
    if round < TEAM_PLAYERS_COUNT {
        return Err(SfsError::InvalidState.into());
    }

    let user_players = user_state.get_user_players()?;
    for i in 0..ActivePlayersList::ITEM_COUNT {
        let player_id = args.get_active_players()?.get(i);
        if !user_players.contains(player_id) {
            return Err(SfsError::OwnerMismatch.into());
        }
    }

    if args.get_week() != root.get_current_week() + 1 {
        return Err(SfsError::InvalidState.into());
    }

    for week in args.get_week()..GAMES_COUNT + 1 {
        let lineup = user_state.get_lineups()?.get_by_week(week)?;
        for i in 0..ActivePlayersList::ITEM_COUNT {
            let player_id = args.get_active_players()?.get(i);
            lineup.set(i, player_id);
        }
    }

    // Check for duplicates
    let lineup = user_state.get_lineups()?.get_by_week(args.get_week())?;
    for i in 0..ActivePlayersList::ITEM_COUNT {
        let index = lineup.index_of(lineup.get(i));
        if index.is_ok() && index? != i {
            return Err(SfsError::AlreadyInUse.into());
        }
    }

    if !user_state.get_is_lineup_set()? {
        user_state.set_is_lineup_set(true);
        for id in 1..user_states.get_count() + 1 {
            if !user_states.get_by_id(id)?.get_is_lineup_set()? {
                return Ok(());
            }
        }
        league.set_start_week(root.get_current_week() + 1);
    }

    Ok(())
}
