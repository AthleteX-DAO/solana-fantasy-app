//! Program entrypoint

#![cfg(feature = "program")]
#![cfg(not(feature = "no-entrypoint"))]

// use crate::{error::SfsError, processor::Processor};
use arrayref::{array_mut_ref, array_ref};
use solana_sdk::{
    account_info::{next_account_info},
    account_info::AccountInfo, entrypoint, entrypoint::ProgramResult,
    program_error::PrintProgramError, pubkey::Pubkey,
};
use crate::{
    // instruction::{SfsInstruction},
    state::{
        Root,
        Player,
        Score,
        // League,
        lists::{ScoreList, PlayerList}
    },
};

entrypoint!(process_instruction);
fn process_instruction<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    instruction_data: &[u8],
) -> ProgramResult {
    // let x = Root { buf: instruction_data };

    let account_info_iter = &mut accounts.iter();
    let root_info = next_account_info(account_info_iter)?;
    let root_data_len = root_info.data_len();

    // let mut state = root_info.data.borrow_mut();
    let mut root = Root{ data: &root_info.data, offset: 0 };


    // let x1 = root.
// {


//     if root.get_scores().get(0).get_is_initialized() {
//         return Ok(());
//     }
// }

root.set_is_initialized(true);
root.set_is_initialized(false);
root.set_is_initialized(true);
root.set_is_initialized(true);

        if !root.get_is_initialized() {
            return Ok(());
        }

        root.set_is_initialized(true);
        root.get_is_initialized();

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

    // if let Err(error) = Processor::process(program_id, accounts, instruction_data) {
    //     // catch the error so we can print it
    //     error.print::<SfsError>();
    //     return Err(error);
    // }
    Ok(())
}
