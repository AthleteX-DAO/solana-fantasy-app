//! Program state processor

use crate::{
    error::SfsError,
    instructions,
    instructions::{arguments::*, instruction::*},
    processor,
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

/// Validates owner(s) are present
pub fn validate_owner(
    program_id: &Pubkey,
    expected_owner: &Pubkey,
    owner_account_info: &AccountInfo,
) -> ProgramResult {
    if expected_owner != owner_account_info.key {
        return Err(SfsError::OwnerMismatch.into());
    }
    if !owner_account_info.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    Ok(())
}

/// Validates bank account address
pub fn validate_bank(program_id: &Pubkey, bank_account_info: &AccountInfo) -> ProgramResult {
    let (bank_pubkey, bump_seed) = Pubkey::find_program_address(&[&[0]], program_id);
    if bank_pubkey != *bank_account_info.key {
        return Err(SfsError::InvalidInstruction.into());
    }
    Ok(())
}

// Pull in syscall stubs when building for non-BPF targets
#[cfg(not(target_arch = "bpf"))]

#[cfg(test)]
pub mod tests {
    use super::*;
    use solana_program::{
        account::Account as SolanaAccount, account_info::create_is_signer_account_infos,
        clock::Epoch, instruction::Instruction, sysvar::rent,
    };

    pub fn pubkey_rand() -> Pubkey {
        Pubkey::new(&rand::random::<[u8; 32]>())
    }

    pub fn do_process_instruction(
        instruction: Instruction,
        accounts: Vec<&mut SolanaAccount>,
    ) -> ProgramResult {
        let mut meta = instruction
            .accounts
            .iter()
            .zip(accounts)
            .map(|(account_meta, account)| (&account_meta.pubkey, account_meta.is_signer, account))
            .collect::<Vec<_>>();

        let account_infos = create_is_signer_account_infos(&mut meta);
        processor::process(&instruction.program_id, &account_infos, &instruction.data)
    }

    // fn do_process_instruction_dups(
    //     instruction: Instruction,
    //     account_infos: Vec<AccountInfo>,
    // ) -> ProgramResult {
    //     Processor::process(&instruction.program_id, &account_infos, &instruction.data)
    // }

    pub fn rent_sysvar() -> SolanaAccount {
        rent::create_account(42, &Rent::default())
    }

    pub fn root_minimum_balance() -> u64 {
        Rent::default().minimum_balance(Root::LEN)
    }
}
