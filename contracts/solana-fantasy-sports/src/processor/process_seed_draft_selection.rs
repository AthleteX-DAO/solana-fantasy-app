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

/// Processes an [SeedDraftSelection](enum.SfsInstruction.html) instruction.
pub fn process_seed_draft_selection<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    args: SeedDraftSelectionArgs,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let root_info = next_account_info(account_info_iter)?;
    let root = Root::new(&root_info.data)?;

    if root.get_stage()? != Stage::Uninitialized {
        return Err(SfsError::InvalidStage.into());
    }

    let pick_order_args = args.get_pick_order()?;
    let pick_order_root = root.get_pick_order()?;

    for i in 0..PickOrderList::ITEM_COUNT {
        pick_order_root.set(i, pick_order_args.get(i));
    }

    Ok(())
}
