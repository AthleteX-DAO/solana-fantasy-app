//! Program entrypoint definitions

use crate::{error::SfsError, processor};
use arrayref::{array_mut_ref, array_ref};
use solana_program::{
    account_info::AccountInfo, entrypoint, entrypoint::ProgramResult,
    program_error::PrintProgramError, pubkey::Pubkey,
};

entrypoint!(process_instruction);
fn process_instruction<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    instruction_data: &'a [u8],
) -> ProgramResult {
    if let Err(error) = processor::process(program_id, accounts, instruction_data) {
        // catch the error so we can print it
        error.print::<SfsError>();
        return Err(error);
    }
    Ok(())
}
