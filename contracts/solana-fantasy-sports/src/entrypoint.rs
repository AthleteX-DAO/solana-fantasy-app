//! Program entrypoint

#![cfg(feature = "program")]
#![cfg(not(feature = "no-entrypoint"))]

use crate::{error::SfsError, processor::Processor};
use solana_sdk::{
    account_info::AccountInfo, entrypoint, entrypoint::ProgramResult,
    program_error::PrintProgramError, pubkey::Pubkey,
};
use crate::{
    instruction::{SfsInstruction},
    state::{
        Root,
        Player,
        League,
        lists::{PlayerList, ActivePlayersList, LeagueList, UserStateList}
    },
};

entrypoint!(process_instruction);
fn process_instruction<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    instruction_data: &[u8],
) -> ProgramResult {
    // let (&tag, rest) = instruction_data.split_first().ok_or(SfsError::InvalidInstruction)?;
    //  let mut root = Box::new(Root::default());
    // let mut x2 = Box::new([0u8; 1000]);

//     for i in 0..200 {
//     let mut x2 = Box::new([0u8; 1000]);
// }
    // let x2 = League::default();
    // for i in 0..20 {
    //     let x2 = League::default();
    // }
    // let x = LeagueList::default();
//    return Ok(());

    if let Err(error) = Processor::process(program_id, accounts, instruction_data) {
        // catch the error so we can print it
        error.print::<SfsError>();
        return Err(error);
    }
    Ok(())
}
