//! Program state processor

#![cfg(feature = "program")]
use crate::{
    error::SfsError,
    instructions,
    instructions::{arguments::*, instruction::*},
    processor,
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

/// Processes an [Instruction](enum.Instruction.html).
pub fn process<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction_data = &RefCell::new(instruction_data);
    let instruction = SfsInstruction::unpack(instruction_data)?;

    match instruction {
        SfsInstruction::AddPlayers { args } => {
            info!("Instruction: AddPlayers");
            processor::process_add_players(program_id, accounts, args)
        }
        SfsInstruction::InitializeRoot { args } => {
            info!("Instruction: InitializeRoot");
            processor::process_initialize_root(program_id, accounts, args)
        }
        SfsInstruction::StartDraftSelection { args } => {
            info!("Instruction: StartDraftSelection");
            processor::process_start_draft_selection(program_id, accounts, args)
        }
        SfsInstruction::StartSeason => {
            info!("Instruction: StartSeason");
            processor::process_start_season(program_id, accounts)
        }
        SfsInstruction::CreateLeague { args } => {
            info!("Instruction: CreateLeague");
            processor::process_create_league(program_id, accounts, args)
        }
        SfsInstruction::JoinLeague { args } => {
            info!("Instruction: JoinLeague");
            processor::process_join_league(program_id, accounts, args)
        }
        SfsInstruction::UpdateLineup { args } => {
            info!("Instruction: UpdateLineup");
            processor::process_update_lineup(program_id, accounts, args)
        }
        SfsInstruction::PickPlayer { args } => {
            info!("Instruction: PickPlayer");
            processor::process_pick_player(program_id, accounts, args)
        }
        SfsInstruction::ProposeSwap { args } => {
            info!("Instruction: ProposeSwap");
            processor::process_propose_swap(program_id, accounts, args)
        }
        SfsInstruction::AcceptSwap { args } => {
            info!("Instruction: AcceptSwap");
            processor::process_accept_swap(program_id, accounts, args)
        }

        _ => return Err(SfsError::InvalidInstruction.into()),
    }
}
