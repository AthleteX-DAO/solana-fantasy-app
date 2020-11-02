//! Error types
use num_derive::FromPrimitive;
use num_traits::FromPrimitive;
use solana_program::{
    decode_error::DecodeError,
    info,
    program_error::{PrintProgramError, ProgramError},
};
use thiserror::Error;

/// Errors that may be returned by the Sfs program.
#[derive(Clone, Debug, Eq, Error, FromPrimitive, PartialEq)]
pub enum SfsError {
    /// Lamport balance below rent-exempt threshold.
    #[error("Lamport balance below rent-exempt threshold")]
    NotRentExempt,
    /// Insufficient funds for the operation requested.
    #[error("Insufficient funds")]
    InsufficientFunds,
    /// Owner does not match.
    #[error("Owner does not match")]
    OwnerMismatch,
    /// The account cannot be initialized because it is already being used.
    #[error("Already in use")]
    AlreadyInUse,
    /// Invalid instruction
    #[error("Invalid instruction")]
    InvalidInstruction,
    /// State is invalid for requested operation.
    #[error("State is invalid for requested operation")]
    InvalidState,
    /// Operation overflowed
    #[error("Operation overflowed")]
    Overflow,
    /// Opertaion is not permitted for current stage
    #[error("Opertaion is not permitted for current stage")]
    InvalidStage,
    #[error("Index is out of array bounds")]
    IndexOutOfRange,
    #[error("Array has no more capacity")]
    OutOfCapacity,
    /// General Error
    #[error("Player not found in a bench list")]
    PlayerNotFound,
    #[error("Item not found in the list")]
    ItemNotFound,
    #[error("Team composition rules are not met")]
    TeamCompositionRulesViolation,
    #[error("Score already updated cannot update again")]
    ScoreAlreadyUpdated,
}
impl From<SfsError> for ProgramError {
    fn from(e: SfsError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
impl<T> DecodeError<T> for SfsError {
    fn type_of() -> &'static str {
        "SfsError"
    }
}
impl PrintProgramError for SfsError {
    fn print<E>(&self)
    where
        E: 'static + std::error::Error + DecodeError<E> + PrintProgramError + FromPrimitive,
    {
        match self {
            SfsError::NotRentExempt => info!("Error: Lamport balance below rent-exempt threshold"),
            SfsError::InsufficientFunds => info!("Error: insufficient funds"),
            SfsError::OwnerMismatch => info!("Error: owner does not match"),
            SfsError::AlreadyInUse => info!("Error: account or token already in use"),
            SfsError::InvalidInstruction => info!("Error: Invalid instruction"),
            SfsError::InvalidState => info!("Error: Invalid account state for operation"),
            SfsError::Overflow => info!("Error: Operation overflowed"),
            SfsError::InvalidStage => info!("Error: Opertaion is not permitted for current stage"),
            SfsError::IndexOutOfRange => info!("Index is out of array bounds"),
            SfsError::OutOfCapacity => info!("Array has no more capacity"),
            SfsError::PlayerNotFound => info!("Player not found in a bench list"),
            SfsError::ItemNotFound => info!("Item not found in the list"),
            SfsError::TeamCompositionRulesViolation => info!("Team composition rules are not met"),
            SfsError::ScoreAlreadyUpdated => info!("Score already updated cannot update again"),
        }
    }
}

// Pull in syscall stubs when building for non-BPF targets
#[cfg(not(target_arch = "bpf"))]

#[cfg(test)]
mod tests {
    use super::*;
    use solana_program::{
        account::Account as SolanaAccount, account_info::create_is_signer_account_infos,
        clock::Epoch, instruction::Instruction, sysvar::rent,
    };

    fn return_sfs_error_as_program_error() -> ProgramError {
        SfsError::InvalidInstruction.into()
    }

    #[test]
    fn test_print_error() {
        let error = return_sfs_error_as_program_error();
        error.print::<SfsError>();
    }

    #[test]
    #[should_panic(expected = "Custom(4)")]
    fn test_error_unwrap() {
        Err::<(), ProgramError>(return_sfs_error_as_program_error()).unwrap();
    }
}
