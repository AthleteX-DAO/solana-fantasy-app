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
    system_instruction::{transfer, SystemInstruction},
    sysvar::{rent::Rent, Sysvar},
};
use std::cell::RefCell;
use std::convert::TryInto;

pub fn process_join_league<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    args: JoinLeagueArgs,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let root_info = next_account_info(account_info_iter)?;
    let root = Root::new(&root_info.data)?;

    if root.get_stage()? != Stage::Join {
        return Err(SfsError::InvalidStage.into());
    }

    let user_account_info = next_account_info(account_info_iter)?;
    let league = root.get_leagues()?.get(args.get_league_id())?;

    let escrow_pubkey = Pubkey::create_program_address(&[b"escrow"], program_id)?;
    let instruction = transfer(user_account_info.key, &escrow_pubkey, league.get_bid());
    invoke(&instruction, accounts)?;

    let user_states = league.get_user_states()?;
    if user_states.get_count() == league.get_users_limit() {
        return Err(SfsError::OutOfCapacity.into());
    }
    user_states.add(*user_account_info.key)?;

    Ok(())
}
