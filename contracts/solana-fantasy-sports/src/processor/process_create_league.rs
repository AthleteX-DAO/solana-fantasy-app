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

    if root.get_stage()? != Stage::Join {
        return Err(SfsError::InvalidStage.into());
    }

    // return Ok(());
    let user_account_info = next_account_info(account_info_iter)?;
    let bank_account_info = next_account_info(account_info_iter)?;
    let system_program_account_info = next_account_info(account_info_iter)?;

    // helpers::validate_bank(program_id, bank_account_info)?;



    // let (bank_pubkey, bump_seed) = Pubkey::find_program_address(&[&[0]], program_id);

    // let instruction = create_account(
    //     user_account_info.key,
    //     bank_account_info.key,
    //     0,
    //     0,
    //     program_id,
    // );
    // invoke_signed(
    //     &instruction,
    //     &[user_account_info.clone(), bank_account_info.clone()],
    //     &[&[&[0, bump_seed]]]
    // )?;

    // return Ok(());
    let instruction = transfer(user_account_info.key, bank_account_info.key, 10);// args.get_bid());
    invoke(&instruction, &[user_account_info.clone(), bank_account_info.clone(), system_program_account_info.clone()])?;

    // return Ok(());
    // if !instruction.accounts[0].is_writable {
    //     return Err(SfsError::InvalidStage.into());
    // }
    // if !instruction.accounts[1].is_writable {
    //     return Err(SfsError::InvalidStage.into());
    // }
    // if !instruction.accounts[0].is_signer {
    //     return Err(SfsError::InvalidStage.into());
    // }
    // return Ok(());

    // if (instruction.accounts[0].pubkey != *(bank_account_info.clone()).key) {
    // return Ok(());
    // return Ok(());

// let account_infos = &[root_info.clone()];
//     for account_meta in instruction.accounts.iter() {
//         for account_info in account_infos.iter() {
//             if account_meta.pubkey == *account_info.key {
//                 if account_meta.is_writable {
//                     let _ = account_info.try_borrow_mut_lamports()?;
//                     let _ = account_info.try_borrow_mut_data()?;
//                 } else {
//                     let _ = account_info.try_borrow_lamports()?;
//                     let _ = account_info.try_borrow_data()?;
//                 }
//                 break;
//             }
//         }
//     }
//     return Ok(());
    // }
    // return Ok(());

    // invoke_signed(
    //     &instruction,
    //     &[ user_account_info.clone()], //,
    //                                   &[&[&[0, bump_seed]]]
    // )?;
    // return Ok(());

    let league = root.get_leagues()?.create()?;
    league.set_name(args.get_name());
    league.set_bid(args.get_bid());
    league.set_users_limit(args.get_users_limit());
    league.set_is_initialized(true);

    league.get_user_states()?.add(*user_account_info.key)?;

    Ok(())
}

pub fn x<'a>(instruction: &Instruction, a: AccountInfo<'a>, b: AccountInfo<'a>) -> ProgramResult {
    invoke_signed(&instruction, &[a, b], &[&[&[0]]])?;
    Ok(())
}
