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

pub fn process_propose_swap<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    args: ProposeSwapArgs,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let root_info = next_account_info(account_info_iter)?;
    let root = Root::new(&root_info.data)?;

    let league = root.get_leagues()?.get(args.get_league_id())?;

    let user_account_info = next_account_info(account_info_iter)?;
    let self_user_state = league
        .get_user_states()?
        .get_by_pub_key(*user_account_info.key)?;
    helpers::validate_owner(
        program_id,
        &self_user_state.get_pub_key(),
        user_account_info,
    )?;
    let self_bench_list = self_user_state.get_user_players()?;

    let other_account_info = next_account_info(account_info_iter)?;
    let other_user_state = league
        .get_user_states()?
        .get_by_pub_key(*other_account_info.key)?;
    let other_bench_list = other_user_state.get_user_players()?;

    // throws if after swap, self user has invalid bench list
    let give_player_index_self = match self_bench_list.index_of(args.get_give_player_id()) {
        Ok(give_player_index_self) => give_player_index_self,
        Err(error) => panic!("There was error: {:?}", error),
    };

    match root.get_players()?.ensure_list_valid_after_set(
        self_bench_list,
        give_player_index_self as usize,
        args.get_want_player_id(),
    ) {
        Err(ret1) => panic!("There was error: {:?}", ret1),
        _ => {}
    };

    // throws if after swap, other user has invalid bench list
    let want_player_index_other = match other_bench_list.index_of(args.get_want_player_id()) {
        Ok(want_player_index_other) => want_player_index_other,
        Err(error) => panic!("There was error: {:?}", error),
    };
    match root.get_players()?.ensure_list_valid_after_set(
        other_bench_list,
        want_player_index_other as usize,
        args.get_give_player_id(),
    ) {
        Err(ret1) => panic!("There was error: {:?}", ret1),
        _ => {}
    };

    // inserting swap proposal in self user
    self_user_state
        .get_swap_proposals()?
        .add(args.get_give_player_id(), args.get_want_player_id());

    Ok(())
}
