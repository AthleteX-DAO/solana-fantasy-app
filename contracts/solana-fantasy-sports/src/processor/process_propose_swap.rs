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

pub fn process_propose_swap<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    args: ProposeSwapArgs,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let root_info = next_account_info(account_info_iter)?;
    let root = Root::new(&root_info.data)?;

    let league = root.get_leagues()?.get(args.get_league_index())?;

    if league.get_start_week() == 0 {
        return Err(SfsError::InvalidState.into());
    }

    let user_account_info = next_account_info(account_info_iter)?;
    let proposing_user_state = league
        .get_user_states()?
        .get_by_id(args.get_proposing_user_id())?;
    helpers::validate_owner(
        program_id,
        &proposing_user_state.get_pub_key(),
        user_account_info,
    )?;

    let mut buffer = [0u8; UserPlayerList::LEN];
    let buffer_cell = RefCell::new(&mut buffer as &mut [u8]);
    let user_player_list_copy = UserPlayerList::new(&buffer_cell, 0)?;

    // validate a user can make a proposal

    if root.get_current_week() > 0
        && proposing_user_state
            .get_lineups()?
            .get_by_week(root.get_current_week())?
            .contains(args.get_give_player_id())
    {
        return Err(SfsError::AlreadyInUse.into());
    }

    proposing_user_state
        .get_user_players()?
        .copy_to(&user_player_list_copy);

    user_player_list_copy.replace_id(args.get_give_player_id(), args.get_want_player_id())?;
    user_player_list_copy.validate_team_composition(&root.get_players()?)?;

    // validate a user can accept proposal

    let accepting_user_state = league
        .get_user_states()?
        .get_by_id(args.get_accepting_user_id())?;

    accepting_user_state
        .get_user_players()?
        .copy_to(&user_player_list_copy);

    user_player_list_copy.replace_id(args.get_want_player_id(), args.get_give_player_id())?;
    user_player_list_copy.validate_team_composition(&root.get_players()?)?;

    // inserting swap proposal in self user
    proposing_user_state
        .get_swap_proposals()?
        .add(args.get_give_player_id(), args.get_want_player_id())?;

    Ok(())
}
