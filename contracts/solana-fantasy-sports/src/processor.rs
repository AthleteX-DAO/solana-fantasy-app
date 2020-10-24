//! Program state processor

#![cfg(feature = "program")]
use crate::{
    error::SfsError,
    instructions,
    instructions::{arguments::*, instruction::*},
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

/// Program state handler.
pub struct Processor {}
impl Processor {
    /// Processes an [InitializeRoot](enum.SfsInstruction.html) instruction.
    pub fn process_initialize_root<'a>(
        program_id: &Pubkey,
        accounts: &'a [AccountInfo<'a>],
        args: InitializeRootArgs,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let root_info = next_account_info(account_info_iter)?;
        let root_data_len = root_info.data_len();
        let rent = &Rent::from_account_info(next_account_info(account_info_iter)?)?;

        let root = Root {
            data: &root_info.data,
            offset: 0,
        };

        if root.get_is_initialized() {
            return Err(SfsError::AlreadyInUse.into());
        }

        if !rent.is_exempt(root_info.lamports(), root_data_len) {
            return Err(SfsError::NotRentExempt.into());
        }

        for i in 0..instructions::PlayerList::ITEM_COUNT {
            let arg_player = args.get_players().get(i);
            let state_player = root.get_players().get(i);

            state_player.set_id(arg_player.get_id());
            state_player.set_position(arg_player.get_position());
            state_player.set_is_initialized(true);
        }

        root.set_oracle_authority(args.get_oracle_authority());
        root.set_is_initialized(true);

        Ok(())
    }

    // pub fn process_update_lineup(
    //     program_id: &Pubkey,
    //     accounts: &[AccountInfo],
    //     league: &u8,
    //     week: &u8,
    //     lineup: ActivePlayersList,
    // ) -> ProgramResult {
    //     let account_info_iter = &mut accounts.iter();
    //     let root_info = next_account_info(account_info_iter)?;
    //     let root_data_len = root_info.data_len();
    //     let rent = &Rent::from_account_info(next_account_info(account_info_iter)?)?;

    //     let mut state = root_info.data.borrow_mut();
    //     let root = Root {
    //         buf: array_mut_ref![state, 0, Root::LEN],
    //     };

    //     if root.get_is_initialized() {
    //         return Err(SfsError::InvalidState.into());
    //     }

    //     let user_account_info = next_account_info(account_info_iter)?;

    //     // @TODO: before mutating check if league and week values entered from user input are authorized

    //     for i in 0..UserStateList::LEN {
    //         let user_state = root
    //             .get_leagues()
    //             .get(*league as usize)
    //             .get_user_states()
    //             .get(i);
    //         if *user_account_info.key == user_state.get_pub_key() {
    //             lineup.copy_to(user_state.get_lineups().get(*week as usize));
    //             break;
    //         }
    //     }

    //     Ok(())
    // }

    // /// Processes an [InitializeAccount](enum.SfsInstruction.html) instruction.
    // pub fn process_test_mutate(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    //     let account_info_iter = &mut accounts.iter();
    //     let root_info = next_account_info(account_info_iter)?;
    //     // let mut root = Root::unpack(&root_info.data.borrow())?;

    //     // let state_info = next_account_info(account_info_iter)?;
    //     // let state_data_len = state_info.data_len();
    //     // if state_info.key != &root.latest_state_account {
    //     //     return Err(SfsError::InvalidState.into());
    //     // }

    //     // Root::pack(root, &mut root_info.data.borrow_mut())?;
    //     Ok(())
    // }

    /// Processes an [Instruction](enum.Instruction.html).
    pub fn process<'a>(
        program_id: &Pubkey,
        accounts: &'a [AccountInfo<'a>],
        instruction_data: &[u8],
    ) -> ProgramResult {
        let instruction_data = &RefCell::new(instruction_data);
        let instruction = SfsInstruction::unpack(instruction_data)?;
        // let mut input_copy = Vec::<u8>::with_capacity(input.len());
        // input_copy.extend_from_slice(input);
        // let instruction = SfsInstruction::unpack(&mut input_copy)?;

        match instruction {
            SfsInstruction::InitializeRoot { args } => {
                info!("Instruction: InitializeRoot");
                Self::process_initialize_root(program_id, accounts, args)
            }
            // SfsInstruction::UpdateLineup {
            //     league,
            //     week,
            //     lineup,
            // } => Self::process_update_lineup(program_id, accounts, &league, &week, lineup),
            // SfsInstruction::TestMutate => {
            //     info!("Instruction: TestMutate");
            //     Self::process_test_mutate(program_id, accounts)
            // }
            _ => return Err(SfsError::InvalidInstruction.into()),
        }
    }
}

// Pull in syscall stubs when building for non-BPF targets
#[cfg(not(target_arch = "bpf"))]
solana_sdk::program_stubs!();

#[cfg(test)]
mod tests {
    use super::*;
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

    // fn do_process_instruction_dups(
    //     instruction: Instruction,
    //     account_infos: Vec<AccountInfo>,
    // ) -> ProgramResult {
    //     Processor::process(&instruction.program_id, &account_infos, &instruction.data)
    // }

    fn rent_sysvar() -> SolanaAccount {
        rent::create_account(42, &Rent::default())
    }

    fn root_minimum_balance() -> u64 {
        Rent::default().minimum_balance(Root::LEN)
    }

    #[test]
    fn test_initialize_root() {
        let program_id = pubkey_rand();
        let owner_key = pubkey_rand();
        let root_key = pubkey_rand();
        let mut root_account = SolanaAccount::new(42, Root::LEN, &program_id);
        let mut rent_sysvar = rent_sysvar();

        let mut args_data = Vec::<u8>::new();
        args_data.extend_from_slice(owner_key.as_ref());
        args_data.extend_from_slice(&[0u8; PlayerList::LEN]);

        // let args_data =
        let args = InitializeRootArgs {
            data: &RefCell::new(&args_data),
            offset: 0,
        };

        // root is not rent exempt
        assert_eq!(
            Err(SfsError::NotRentExempt.into()),
            do_process_instruction(
                initialize_root(&program_id, &root_key, args.clone()).unwrap(),
                vec![&mut root_account, &mut rent_sysvar]
            )
        );
        root_account.lamports = root_minimum_balance();

        // create new root
        do_process_instruction(
            initialize_root(&program_id, &root_key, args.clone()).unwrap(),
            vec![&mut root_account, &mut rent_sysvar],
        )
        .unwrap();

        // create twice
        assert_eq!(
            Err(SfsError::AlreadyInUse.into()),
            do_process_instruction(
                initialize_root(&program_id, &root_key, args.clone()).unwrap(),
                vec![&mut root_account, &mut rent_sysvar],
            )
        );

        let root = Root {
            data: &RefCell::new(&mut root_account.data),
            offset: 0,
        };
        assert_eq!(root.get_oracle_authority(), owner_key);
    }
}
