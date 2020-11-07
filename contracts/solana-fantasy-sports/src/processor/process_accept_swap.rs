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

pub fn process_accept_swap<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    args: AcceptSwapArgs,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let root_info = next_account_info(account_info_iter)?;
    let root = Root::new(&root_info.data)?;

    let user_account_info = next_account_info(account_info_iter)?;

    let league = root.get_leagues()?.get(args.get_league_index())?;

    if league.get_start_week() == 0 {
        return Err(SfsError::InvalidState.into());
    }

    let accepting_user_state = league
        .get_user_states()?
        .get_by_id(args.get_accepting_user_id())?;

    helpers::validate_owner(
        program_id,
        &accepting_user_state.get_pub_key(),
        user_account_info,
    )?;

    let proposing_user_state = league
        .get_user_states()?
        .get_by_id(args.get_proposing_user_id())?;

    if root.get_current_week() > 0 {
        if accepting_user_state
            .get_lineups()?
            .get_by_week(root.get_current_week())?
            .contains(args.get_want_player_id())
        {
            return Err(SfsError::AlreadyInUse.into());
        }

        if proposing_user_state
            .get_lineups()?
            .get_by_week(root.get_current_week())?
            .contains(args.get_give_player_id())
        {
            return Err(SfsError::AlreadyInUse.into());
        }
    }

    // Executing the swap
    accepting_user_state
        .get_user_players()?
        .replace_id(args.get_want_player_id(), args.get_give_player_id())?;
    accepting_user_state
        .get_user_players()?
        .validate_team_composition(&root.get_players()?)?;

    proposing_user_state
        .get_user_players()?
        .replace_id(args.get_give_player_id(), args.get_want_player_id())?;
    proposing_user_state
        .get_user_players()?
        .validate_team_composition(&root.get_players()?)?;

    proposing_user_state
        .get_swap_proposals()?
        .remove(args.get_give_player_id(), args.get_want_player_id())?;

    for i in root.get_current_week() + 1..GAMES_COUNT + 1 {
        let lineup = proposing_user_state.get_lineups()?.get_by_week(i)?;

        if lineup.contains(args.get_give_player_id()) {
            lineup.replace_id(args.get_give_player_id(), args.get_want_player_id())?;
        }

        let lineup = accepting_user_state.get_lineups()?.get_by_week(i)?;

        if lineup.contains(args.get_want_player_id()) {
            lineup.replace_id(args.get_want_player_id(), args.get_give_player_id())?;
        }
    }

    Ok(())
}
