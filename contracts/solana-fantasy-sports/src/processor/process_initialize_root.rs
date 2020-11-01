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
    let root = Root::new(&root_info.data)?;

    if root.get_stage()? != Stage::Uninitialized {
        return Err(SfsError::InvalidStage.into());
    }

    if !rent.is_exempt(root_info.lamports(), root_data_len) {
        return Err(SfsError::NotRentExempt.into());
    }

    root.set_oracle_authority(args.get_oracle_authority());
    root.set_current_week(args.get_current_week());
    root.set_stage(Stage::SeasonOpen);

    Ok(())
}

// Pull in syscall stubs when building for non-BPF targets
#[cfg(not(target_arch = "bpf"))]

#[cfg(test)]
mod tests {
    use super::helpers::tests::*;
    use super::*;
    use solana_program::{
        account::Account as SolanaAccount, account_info::create_is_signer_account_infos,
        clock::Epoch, instruction::Instruction, sysvar::rent,
    };

    #[test]
    fn test_initialize_root() {
        let program_id = pubkey_rand();
        let owner_key = pubkey_rand();
        let root_key = pubkey_rand();
        let mut root_account = SolanaAccount::new(42, Root::LEN, &program_id);
        let mut rent_sysvar = rent_sysvar();

        let mut args_data = Vec::<u8>::new();
        args_data.extend_from_slice(owner_key.as_ref());

        let args_data = &RefCell::new(args_data.as_slice());
        let args = InitializeRootArgs::new(args_data, 0).unwrap();

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
            Err(SfsError::InvalidStage.into()),
            do_process_instruction(
                initialize_root(&program_id, &root_key, args.clone()).unwrap(),
                vec![&mut root_account, &mut rent_sysvar],
            )
        );

        let root_data = &RefCell::new(&mut *root_account.data);
        let root = Root::new(root_data).unwrap();
        assert_eq!(root.get_oracle_authority(), owner_key);
    }
}
