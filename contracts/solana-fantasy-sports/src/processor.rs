// //! Program state processor

// #![cfg(feature = "program")]
// use crate::{
//     error::SfsError,
//     instruction::SfsInstruction,
//     state::{
//         lists::{ActivePlayersList, LeagueList, PlayerList, UserStateList},
//         League, Player, Root,
//     },
// };
// use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};
// use num_traits::FromPrimitive;
// use solana_sdk::program::invoke;
// use solana_sdk::program::invoke_signed;
// use solana_sdk::{
//     account_info::{next_account_info, AccountInfo},
//     decode_error::DecodeError,
//     entrypoint::ProgramResult,
//     info,
//     instruction::{AccountMeta, Instruction},
//     program_error::{PrintProgramError, ProgramError},
//     program_option::COption,
//     program_pack::{IsInitialized, Pack},
//     pubkey::Pubkey,
//     system_instruction::SystemInstruction,
//     sysvar::{rent::Rent, Sysvar},
// };

// /// Program state handler.
// pub struct Processor {}
// impl Processor {
//     /// Processes an [InitializeRoot](enum.SfsInstruction.html) instruction.
//     pub fn process_initialize_root<'a>(
//         program_id: &Pubkey,
//         accounts: &'a [AccountInfo],
//         oracle_authority: Pubkey,
//         players: PlayerList,
//     ) -> ProgramResult {
//         let account_info_iter = &mut accounts.iter();
//         let root_info = next_account_info(account_info_iter)?;
//         let root_data_len = root_info.data_len();
//         let rent = &Rent::from_account_info(next_account_info(account_info_iter)?)?;

//         let mut state = root_info.data.borrow_mut();
//         let root = Root {
//             buf: array_mut_ref![state, 0, Root::LEN],
//         };

//         if root.get_is_initialized() {
//             return Err(SfsError::AlreadyInUse.into());
//         }

//         if !rent.is_exempt(root_info.lamports(), root_data_len) {
//             return Err(SfsError::NotRentExempt.into());
//         }

//         players.copy_to(root.get_players());
//         root.set_oracle_authority(oracle_authority);
//         root.set_is_initialized(true);

//         Ok(())
//     }

//     pub fn process_update_lineup(
//         program_id: &Pubkey,
//         accounts: &[AccountInfo],
//         league: &u8,
//         week: &u8,
//         lineup: ActivePlayersList,
//     ) -> ProgramResult {
//         let account_info_iter = &mut accounts.iter();
//         let root_info = next_account_info(account_info_iter)?;
//         let root_data_len = root_info.data_len();
//         let rent = &Rent::from_account_info(next_account_info(account_info_iter)?)?;

//         let mut state = root_info.data.borrow_mut();
//         let root = Root {
//             buf: array_mut_ref![state, 0, Root::LEN],
//         };

//         if root.get_is_initialized() {
//             return Err(SfsError::InvalidState.into());
//         }

//         let user_account_info = next_account_info(account_info_iter)?;

//         // @TODO: before mutating check if league and week values entered from user input are authorized

//         for i in 0..UserStateList::LEN {
//             let user_state = root
//                 .get_leagues()
//                 .get(*league as usize)
//                 .get_user_states()
//                 .get(i);
//             if *user_account_info.key == user_state.get_pub_key() {
//                 lineup.copy_to(user_state.get_lineups().get(*week as usize));
//                 break;
//             }
//         }

//         Ok(())
//     }

//     /// Processes an [InitializeAccount](enum.SfsInstruction.html) instruction.
//     pub fn process_test_mutate(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
//         let account_info_iter = &mut accounts.iter();
//         let root_info = next_account_info(account_info_iter)?;
//         // let mut root = Root::unpack(&root_info.data.borrow())?;

//         // let state_info = next_account_info(account_info_iter)?;
//         // let state_data_len = state_info.data_len();
//         // if state_info.key != &root.latest_state_account {
//         //     return Err(SfsError::InvalidState.into());
//         // }

//         // Root::pack(root, &mut root_info.data.borrow_mut())?;
//         Ok(())
//     }

//     /// Processes an [Instruction](enum.Instruction.html).
//     pub fn process(program_id: &Pubkey, accounts: &[AccountInfo], input: &[u8]) -> ProgramResult {
//         let mut input_copy = Vec::<u8>::with_capacity(input.len());
//         input_copy.extend_from_slice(input);
//         let instruction = SfsInstruction::unpack(&mut input_copy)?;

//         match instruction {
//             SfsInstruction::InitializeRoot {
//                 oracle_authority,
//                 players,
//             } => {
//                 info!("Instruction: InitializeRoot");
//                 Self::process_initialize_root(program_id, accounts, oracle_authority, players)
//             }
//             SfsInstruction::UpdateLineup {
//                 league,
//                 week,
//                 lineup,
//             } => Self::process_update_lineup(program_id, accounts, &league, &week, lineup),
//             SfsInstruction::TestMutate => {
//                 info!("Instruction: TestMutate");
//                 Self::process_test_mutate(program_id, accounts)
//             }
//         }
//     }
// }

// impl PrintProgramError for SfsError {
//     fn print<E>(&self)
//     where
//         E: 'static + std::error::Error + DecodeError<E> + PrintProgramError + FromPrimitive,
//     {
//         match self {
//             SfsError::NotRentExempt => info!("Error: Lamport balance below rent-exempt threshold"),
//             SfsError::InsufficientFunds => info!("Error: insufficient funds"),
//             SfsError::OwnerMismatch => info!("Error: owner does not match"),
//             SfsError::AlreadyInUse => info!("Error: account or token already in use"),
//             SfsError::InvalidInstruction => info!("Error: Invalid instruction"),
//             SfsError::InvalidState => info!("Error: Invalid account state for operation"),
//             SfsError::Overflow => info!("Error: Operation overflowed"),
//         }
//     }
// }

// // Pull in syscall stubs when building for non-BPF targets
// #[cfg(not(target_arch = "bpf"))]
// solana_sdk::program_stubs!();

// #[cfg(test)]
// mod tests {
//     use super::*;
//     use crate::instruction::*;
//     use solana_sdk::{
//         account::Account as SolanaAccount, account_info::create_is_signer_account_infos,
//         clock::Epoch, instruction::Instruction, sysvar::rent,
//     };

//     fn pubkey_rand() -> Pubkey {
//         Pubkey::new(&rand::random::<[u8; 32]>())
//     }

//     // fn do_process_instruction(
//     //     instruction: Instruction,
//     //     accounts: Vec<&'static mut SolanaAccount>,
//     // ) -> ProgramResult {
//     //     let mut meta = instruction
//     //         .accounts
//     //         .iter()
//     //         .zip(accounts)
//     //         .map(|(account_meta, account)| (&account_meta.pubkey, account_meta.is_signer, account))
//     //         .collect::<Vec<_>>();

//     //     let account_infos = create_is_signer_account_infos(&mut meta);
//     //     Processor::process(&instruction.program_id, &account_infos, &instruction.data)
//     // }

//     // fn do_process_instruction_dups(
//     //     instruction: Instruction,
//     //     account_infos: Vec<AccountInfo>,
//     // ) -> ProgramResult {
//     //     Processor::process(&instruction.program_id, &account_infos, &instruction.data)
//     // }

//     fn return_sfs_error_as_program_error() -> ProgramError {
//         SfsError::InvalidInstruction.into()
//     }

//     fn rent_sysvar() -> SolanaAccount {
//         rent::create_account(42, &Rent::default())
//     }

//     // fn root_minimum_balance() -> u64 {
//     //     Rent::default().minimum_balance(Root::LEN)
//     // }

//     #[test]
//     fn test_print_error() {
//         let error = return_sfs_error_as_program_error();
//         error.print::<SfsError>();
//     }

//     #[test]
//     #[should_panic(expected = "Custom(4)")]
//     fn test_error_unwrap() {
//         Err::<(), ProgramError>(return_sfs_error_as_program_error()).unwrap();
//     }

//     // #[test]
//     // fn test_initialize_root() {
//     //     let program_id = pubkey_rand();
//     //     let owner_key = pubkey_rand();
//     //     let root_key = pubkey_rand();
//     //     let players = PlayerList::default();
//     //     let mut root_account = SolanaAccount::new(42, Root::LEN, &program_id);
//     //     let mut rent_sysvar = rent_sysvar();

//     //     // root is not rent exempt
//     //     assert_eq!(
//     //         Err(SfsError::NotRentExempt.into()),
//     //         do_process_instruction(
//     //             initialize_root(&program_id, &root_key, &owner_key, players.clone()).unwrap(),
//     //             vec![&mut root_account, &mut rent_sysvar]
//     //         )
//     //     );
//     //     root_account.lamports = root_minimum_balance();

//     //     // create new root
//     //     do_process_instruction(
//     //         initialize_root(&program_id, &root_key, &owner_key, players.clone()).unwrap(),
//     //         vec![&mut root_account, &mut rent_sysvar],
//     //     )
//     //     .unwrap();

//     //     // create twice
//     //     assert_eq!(
//     //         Err(SfsError::AlreadyInUse.into()),
//     //         do_process_instruction(
//     //             initialize_root(&program_id, &root_key, &owner_key, players.clone()).unwrap(),
//     //             vec![&mut root_account, &mut rent_sysvar],
//     //         )
//     //     );

//     //     let root = Root { buf: &root_account.data };
//     //     assert_eq!(root.get_oracle_authority(), owner_key);
//     // }
// }
