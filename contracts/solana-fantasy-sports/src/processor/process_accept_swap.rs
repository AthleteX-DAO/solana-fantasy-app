//! Program state processor

#![cfg(feature = "program")]
use crate::{
    error::SfsError,
    instructions,
    instructions::{arguments::*, instruction::*},
    processor::helpers,
    state::*,
};
use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};
use num_traits::FromPrimitive;
use solana_sdk::program::invoke;
use solana_sdk::program::invoke_signed;
use solana_sdk::{
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

    // @TODO: before mutating check if the condition of players bench is satisfied after the swap

    // Sudo code
    // 1. Get the swap proposal
    // 2. Check if the want player exists with self user
    // 3. If it does then

    let league = root.get_leagues()?.get(args.get_league_id())?;
    let accepting_user_state = league
        .get_user_states()?
        .get(args.get_accepting_user_id())?;

    helpers::validate_owner(
        program_id,
        &accepting_user_state.get_pub_key(),
        user_account_info,
    )?;

    let proposing_user = league
        .get_user_states()?
        .get(args.get_proposing_user_id())?;

    // Getting the swap proposal to work with
    let swap_proposal = proposing_user
        .get_swap_proposals()?
        .get(args.get_proposal_id())?;

    if !swap_proposal.get_is_initialized()? {
        // throw that a proposal doesnot exist at given index
    }

    let self_user = league
        .get_user_states()?
        .get_by_pub_key(*user_account_info.key);

    let want_player_id = swap_proposal.get_want_player_id();
    let want_player_index_accepting_user = accepting_user_state
        .get_user_players()?
        .index_of(want_player_id)
        .ok()
        .ok_or(SfsError::OwnerMismatch)?;

    if accepting_user_state
        .get_lineups()?
        .get(root.get_current_week())?
        .contains(want_player_id)
    {
        return Err(SfsError::AlreadyInUse.into());
    }

    let give_player_id = swap_proposal.get_give_player_id();
    let give_player_index_proposing_user = proposing_user
        .get_user_players()?
        .index_of(give_player_id)
        .ok()
        .ok_or(SfsError::OwnerMismatch)?;


    if proposing_user
        .get_lineups()?
        .get(root.get_current_week())?
        .contains(give_player_id)
    {
        return Err(SfsError::AlreadyInUse.into());
    }

    // Executing the swap
    accepting_user_state
        .get_user_players()?
        .set(want_player_index_accepting_user, give_player_id);
    proposing_user
        .get_user_players()?
        .set(give_player_index_proposing_user, want_player_id);

    Ok(())
}
