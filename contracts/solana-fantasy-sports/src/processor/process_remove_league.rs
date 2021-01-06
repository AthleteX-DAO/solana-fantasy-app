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
use crate::{
    error::SfsError,
    instructions,
    instructions::{arguments::*, instruction::*},
    processor::helpers,
    state::*,
};

pub fn process_remove_league<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    args: RemoveLeagueArgs,
) -> ProgramResult{
    let account_info_iter = &mut accounts.iter();
    let root_info = next_account_info(account_info_iter)?;
    let root = Root::new(&root_info.data)?;
    let user_account_info = next_account_info(account_info_iter)?;

    helpers::validate_owner(program_id, &root.get_oracle_authority(), user_account_info)?;

    let index = args.get_league_index();
    root.get_leagues()?.remove(index)?;

    Ok(())
}