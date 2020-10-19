//! Program state processor

#![cfg(feature = "program")]

use crate::{
    error::SfsError,
    instruction::{SfsInstruction},
    state::{Root, State, AccountState},
};
use num_traits::FromPrimitive;
use solana_sdk::program::invoke;
use solana_sdk::program::invoke_signed;
use solana_sdk::{
    instruction::{AccountMeta, Instruction},
    account_info::{next_account_info, AccountInfo},
    decode_error::DecodeError,
    entrypoint::ProgramResult,
    info,
    program_error::{PrintProgramError, ProgramError},
    program_option::COption,
    program_pack::{IsInitialized, Pack},
    pubkey::Pubkey,
    sysvar::{rent::Rent, Sysvar},
    system_instruction::SystemInstruction,
};

/// Program state handler.
pub struct Processor {}
impl Processor {
    /// Processes an [InitializeRoot](enum.SfsInstruction.html) instruction.
    pub fn process_initialize_root(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        oracle_authority: COption<Pubkey>,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let root_info = next_account_info(account_info_iter)?;
        let root_data_len = root_info.data_len();
        let rent = &Rent::from_account_info(next_account_info(account_info_iter)?)?;

        let mut root = Root::unpack_unchecked(&root_info.data.borrow())?;
        if root.is_initialized {
            return Err(SfsError::AlreadyInUse.into());
        }

        if !rent.is_exempt(root_info.lamports(), root_data_len) {
            return Err(SfsError::NotRentExempt.into());
        }

        let state = State{ test: String::from("hello") };

        let data = CreateAccount::pack(SystemInstruction::CreateAccount{
            lamports: 0,
            space: 0,
            owner: program_id.clone().into(),
        });

        let accounts2 = vec![
            AccountMeta::new(*program_id, false),
        ];

        let instruction = Instruction {
            program_id: Pubkey::new(&String::from("11111111111111111111111111111111").into_bytes()),
            accounts: accounts2,
            data,
        }
        invoke(&instruction, &accounts2[..])?;

        // root.state =;
        root.oracle_authority = oracle_authority;
        root.is_initialized = true;

        Root::pack(root, &mut root_info.data.borrow_mut())?;

        Ok(())
    }

    /// Processes an [InitializeAccount](enum.SfsInstruction.html) instruction.
    pub fn process_test_mutate(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();

        let root_info = next_account_info(account_info_iter)?;
        let root_data_len = root_info.data_len();

        let mut root = Root::unpack_unchecked(&root_info.data.borrow())?;
        if !root.is_initialized {
            return Err(SfsError::InvalidState.into());
        }

        let state_info = next_account_info(account_info_iter)?;
        let state_data_len = state_info.data_len();
        if state_info.key != &root.latest_state_account {
            return Err(SfsError::InvalidState.into());
        }

        let state = State::unpack_from_slice(&state_info.data.borrow())?;
        info!(&state.test);


        Ok(())
    }

    /// Processes an [Instruction](enum.Instruction.html).
    pub fn process(program_id: &Pubkey, accounts: &[AccountInfo], input: &[u8]) -> ProgramResult {
        let instruction = SfsInstruction::unpack(input)?;

        match instruction {
            SfsInstruction::InitializeRoot {
                oracle_authority,
            } => {
                info!("Instruction: InitializeRoot");
                Self::process_initialize_root(program_id, accounts, oracle_authority)
            }
            SfsInstruction::TestMutate => {
                info!("Instruction: TestMutate");
                Self::process_test_mutate(program_id, accounts)
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

    fn root_minimum_balance() -> u64 {
        Rent::default().minimum_balance(Root::get_packed_len())
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

    #[test]
    fn test_pack_unpack() {
        // Root
        let check = Root {
            oracle_authority: COption::Some(Pubkey::new(&[1; 32])),
            latest_state_account: Pubkey::new(&[2; 32]),
            is_initialized: true,
        };
        let mut packed = vec![0; Root::get_packed_len() + 1];
        assert_eq!(
            Err(ProgramError::InvalidAccountData),
            Root::pack(check, &mut packed)
        );
        let mut packed = vec![0; Root::get_packed_len() - 1];
        assert_eq!(
            Err(ProgramError::InvalidAccountData),
            Root::pack(check, &mut packed)
        );
        let mut packed = vec![0; Root::get_packed_len()];
        Root::pack(check, &mut packed).unwrap();
        let mut expect = vec![1, 0, 0, 0];
        expect.extend_from_slice(&[1u8; 32]);
        expect.extend_from_slice(&[2u8; 32]);
        expect.extend_from_slice(&[1u8]);
        assert_eq!(packed, expect);
        let unpacked = Root::unpack(&packed).unwrap();
        assert_eq!(unpacked, check);
    }

    #[test]
    fn test_initialize_root() {
        let program_id = pubkey_rand();
        let owner_key = pubkey_rand();
        let root_key = pubkey_rand();
        let mut root_account = SolanaAccount::new(42, Root::get_packed_len(), &program_id);
        let mut rent_sysvar = rent_sysvar();

        // root is not rent exempt
        assert_eq!(
            Err(SfsError::NotRentExempt.into()),
            do_process_instruction(
                initialize_root(&program_id, &root_key, Some(&owner_key)).unwrap(),
                vec![&mut root_account, &mut rent_sysvar]
            )
        );

        root_account.lamports = root_minimum_balance();

        // create new root
        do_process_instruction(
            initialize_root(&program_id, &root_key, Some(&owner_key)).unwrap(),
            vec![&mut root_account, &mut rent_sysvar],
        )
        .unwrap();

        // create twice
        assert_eq!(
            Err(SfsError::AlreadyInUse.into()),
            do_process_instruction(
                initialize_root(&program_id, &root_key, Some(&owner_key)).unwrap(),
                vec![&mut root_account, &mut rent_sysvar],
            )
        );

        let root = Root::unpack_unchecked(&root_account.data).unwrap();
        assert_eq!(root.oracle_authority, COption::Some(owner_key));
    }
}
