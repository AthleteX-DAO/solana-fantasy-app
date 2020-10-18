//! Program state processor

#![cfg(feature = "program")]

use crate::{
    error::SfsError,
    instruction::{SfsInstruction},
    state::{Account, AccountState},
};
use num_traits::FromPrimitive;
use solana_sdk::{
    account_info::{next_account_info, AccountInfo},
    decode_error::DecodeError,
    entrypoint::ProgramResult,
    info,
    program_error::{PrintProgramError, ProgramError},
    program_option::COption,
    program_pack::{IsInitialized, Pack},
    pubkey::Pubkey,
    sysvar::{rent::Rent, Sysvar},
};

/// Program state handler.
pub struct Processor {}
impl Processor {
    /// Processes an [InitializeAccount](enum.SfsInstruction.html) instruction.
    pub fn process_test_mutate(accounts: &[AccountInfo]) -> ProgramResult {
        Ok(())
    }

    /// Processes an [Instruction](enum.Instruction.html).
    pub fn process(program_id: &Pubkey, accounts: &[AccountInfo], input: &[u8]) -> ProgramResult {
        let instruction = SfsInstruction::unpack(input)?;

        match instruction {
            SfsInstruction::TestMutate => {
                info!("Instruction: TestMutate");
                Self::process_test_mutate(accounts)
            }
        }
    }
}

impl PrintProgramError for SfsError {
    fn print<E>(&self)
    where
        E: 'static + std::error::Error + DecodeError<E> + PrintProgramError + FromPrimitive,
    {
        match self {
            SfsError::NotRentExempt => {
                info!("Error: Lamport balance below rent-exempt threshold")
            }
            SfsError::InsufficientFunds => info!("Error: insufficient funds"),
            SfsError::OwnerMismatch => info!("Error: owner does not match"),
            SfsError::AlreadyInUse => info!("Error: account or token already in use"),
            SfsError::InvalidInstruction => info!("Error: Invalid instruction"),
            SfsError::InvalidState => info!("Error: Invalid account state for operation"),
            SfsError::Overflow => info!("Error: Operation overflowed"),
        }
    }
}

// Pull in syscall stubs when building for non-BPF targets
#[cfg(not(target_arch = "bpf"))]
solana_sdk::program_stubs!();

#[cfg(test)]
mod tests {
    use super::*;
    use crate::instruction::*;
    use solana_sdk::{
        account::Account as SolanaAccount, account_info::create_is_signer_account_infos,
        clock::Epoch, instruction::Instruction, sysvar::rent,
    };

    fn pubkey_rand() -> Pubkey {
        Pubkey::new(&rand::random::<[u8; 32]>())
    }

    fn do_process_instruction(
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
        Processor::process(&instruction.program_id, &account_infos, &instruction.data)
    }

    fn do_process_instruction_dups(
        instruction: Instruction,
        account_infos: Vec<AccountInfo>,
    ) -> ProgramResult {
        Processor::process(&instruction.program_id, &account_infos, &instruction.data)
    }

    fn return_sfs_error_as_program_error() -> ProgramError {
        SfsError::InvalidInstruction.into()
    }

    fn rent_sysvar() -> SolanaAccount {
        rent::create_account(42, &Rent::default())
    }

    #[test]
    fn test_print_error() {
        let error = return_sfs_error_as_program_error();
        error.print::<SfsError>();
    }

    #[test]
    #[should_panic(expected = "Custom(5)")]
    fn test_error_unwrap() {
        Err::<(), ProgramError>(return_sfs_error_as_program_error()).unwrap();
    }
}
