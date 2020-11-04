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
    account::Account,
    account_info::{next_account_info, AccountInfo},
    decode_error::DecodeError,
    entrypoint::ProgramResult,
    info,
    instruction::{AccountMeta, Instruction},
    program_error::{PrintProgramError, ProgramError},
    program_option::COption,
    program_pack::{IsInitialized, Pack},
    pubkey::Pubkey,
    system_instruction::{create_account, transfer, SystemInstruction},
    sysvar::{rent::Rent, Sysvar},
};
use std::cell::RefCell;
use std::convert::TryInto;

pub fn process_create_league<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    args: CreateLeagueArgs,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let root_info = next_account_info(account_info_iter)?;
    let root = Root::new(&root_info.data)?;

    if root.get_stage()? != Stage::SeasonOpen {
        return Err(SfsError::InvalidStage.into());
    }

    if root.get_current_week() >= consts::GAMES_COUNT {
        return Err(SfsError::InvalidState.into());
    }

    let user_account_info = next_account_info(account_info_iter)?;
    let bank_account_info = next_account_info(account_info_iter)?;
    let system_program_account_info = next_account_info(account_info_iter)?;

    helpers::validate_bank(program_id, bank_account_info)?;

    let instruction = transfer(user_account_info.key, bank_account_info.key, args.get_bid());
    let accounts = [
        user_account_info.clone(),
        bank_account_info.clone(),
        system_program_account_info.clone(),
    ];
    invoke(&instruction, &accounts)?;

    let league = root.get_leagues()?.create()?;
    league.set_name(args.get_name());
    league.set_bid(args.get_bid());
    league.set_users_limit(args.get_users_limit());
    league.set_is_initialized(true);

    let user_state = league.get_user_states()?.add(*user_account_info.key)?;
    user_state.set_team_name(args.get_team_name());

    Ok(())
}
