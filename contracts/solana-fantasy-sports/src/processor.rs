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
use std::convert::TryInto;

/// Program state handler.
pub struct Processor {}
impl Processor {
    /// Processes an [AddPlayers](enum.SfsInstruction.html) instruction.
    pub fn process_add_players<'a>(
        program_id: &Pubkey,
        accounts: &'a [AccountInfo<'a>],
        args: AddPlayersArgs,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let root_info = next_account_info(account_info_iter)?;
        let root = Root::new(&root_info.data)?;

        if root.get_stage()? != Stage::Uninitialized {
            return Err(SfsError::InvalidStage.into());
        }

        let players_args = args.get_players()?;
        let players_root = root.get_players()?;
        for i in 0..players_args.get_count() {
            let arg_player = players_args.get(i)?;
            players_root.add(arg_player.get_external_id(), arg_player.get_position()?)?;
        }

        Ok(())
    }

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
        root.set_stage(Stage::Join);

        Ok(())
    }

    /// Processes an [StartDraftSelection](enum.SfsInstruction.html) instruction.
    pub fn process_start_draft_selection<'a>(
        program_id: &Pubkey,
        accounts: &'a [AccountInfo<'a>],
        args: StartDraftSelectionArgs,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let root_info = next_account_info(account_info_iter)?;
        let root = Root::new(&root_info.data)?;

        if root.get_stage()? != Stage::Join {
            return Err(SfsError::InvalidStage.into());
        }

        let pick_order_args = args.get_pick_order()?;
        let pick_order_root = root.get_pick_order()?;

        for i in 0..PickOrderList::ITEM_COUNT {
            pick_order_root.set(i, pick_order_args.get(i));
        }

        root.set_stage(Stage::DraftSelection);

        Ok(())
    }

    /// Processes an [StartSeason](enum.SfsInstruction.html) instruction.
    pub fn process_start_season<'a>(
        program_id: &Pubkey,
        accounts: &'a [AccountInfo<'a>],
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let root_info = next_account_info(account_info_iter)?;
        let root = Root::new(&root_info.data)?;

        if root.get_stage()? != Stage::DraftSelection {
            return Err(SfsError::InvalidStage.into());
        }

        root.set_stage(Stage::SeasonOpen);

        Ok(())
    }

    /// Processes an [AddPlayers](enum.SfsInstruction.html) instruction.
    pub fn process_pick_player<'a>(
        program_id: &Pubkey,
        accounts: &'a [AccountInfo<'a>],
        args: PickPlayerArgs,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let root_info = next_account_info(account_info_iter)?;
        let root = Root::new(&root_info.data)?;
        let user_account_info = next_account_info(account_info_iter)?;

        if root.get_stage()? != Stage::DraftSelection {
            return Err(SfsError::InvalidStage.into());
        }

        let player_id = args.get_player_id();

        if player_id >= root.get_players()?.get_count() {
            return Err(SfsError::IndexOutOfRange.into());
        }

        let league = root.get_leagues()?.get(args.get_league_id())?;
        let user_state = league.get_user_states()?.get(args.get_user_id())?;

        Self::validate_owner(program_id, &user_state.get_pub_key(), user_account_info)?;

        let users_count = league.get_user_states()?.get_count();

        let mut league_pick_order = Vec::<u8>::with_capacity(users_count as usize);
        for i in 0..PickOrderList::ITEM_COUNT {
            let pick = root.get_pick_order()?.get(i);
            if pick < users_count {
                league_pick_order.push(pick);
                if league_pick_order.len() == users_count as usize {
                    break;
                }
            }
        }

        let round = (league.get_current_pick() / users_count as u16) as u8;
        if round >= TEAM_PLAYERS_COUNT {
            return Err(SfsError::InvalidState.into());
        }

        let mut pick_in_round = (league.get_current_pick() % users_count as u16) as u8;
        if round % 2 == 0 {
            pick_in_round = users_count - pick_in_round - 1;
        }
        let current_pick_user_id = league_pick_order[pick_in_round as usize];

        if args.get_user_id() != current_pick_user_id {
            return Err(SfsError::InvalidState.into());
        }
        for i in 0..users_count {
            let user_players = league.get_user_states()?.get(i)?.get_user_players()?;
            if user_players.contains(player_id) {
                return Err(SfsError::AlreadyInUse.into());
            }
        }

        user_state.get_user_players()?.set(round, player_id);
        league.set_current_pick(league.get_current_pick() + 1);

        Ok(())
    }

    pub fn process_update_lineup<'a>(
        program_id: &Pubkey,
        accounts: &'a [AccountInfo<'a>],
        args: UpdateLineupArgs,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let root_info = next_account_info(account_info_iter)?;
        let root = Root::new(&root_info.data)?;
        let user_account_info = next_account_info(account_info_iter)?;

        if root.get_stage()? != Stage::DraftSelection || root.get_stage()? != Stage::SeasonOpen {
            return Err(SfsError::InvalidStage.into());
        }

        let user_account_info = next_account_info(account_info_iter)?;

        let league = root.get_leagues()?.get(args.get_league_id())?;
        let user_state = league.get_user_states()?.get(args.get_user_id())?;

        Self::validate_owner(program_id, &user_state.get_pub_key(), user_account_info)?;

        let round =
            (league.get_current_pick() / league.get_user_states()?.get_count() as u16) as u8;
        // Checking if draft selection complete for this league
        if round < TEAM_PLAYERS_COUNT {
            return Err(SfsError::InvalidState.into());
        }

        let user_players = user_state.get_user_players()?;
        for i in 0..ActivePlayersList::ITEM_COUNT {
            let player_id = args.get_active_players()?.get(i);
            if !user_players.contains(player_id) {
                return Err(SfsError::OwnerMismatch.into());
            }
        }

        let week = args.get_week();
        if week <= root.get_current_week() {
            return Err(SfsError::InvalidState.into());
        }

        let lineup = user_state.get_lineups()?.get(week)?;
        for i in 0..ActivePlayersList::ITEM_COUNT {
            let player_id = args.get_active_players()?.get(i);
            lineup.set(i, player_id);
        }

        Ok(())
    }

    pub fn process_propose_swap<'a>(
        program_id: &Pubkey,
        accounts: &'a [AccountInfo<'a>],
        args: ProposeSwapArgs,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let root_info = next_account_info(account_info_iter)?;
        let root = Root::new(&root_info.data)?;

        let user_account_info = next_account_info(account_info_iter)?;
        let other_account_info = next_account_info(account_info_iter)?;

        // @TODO: before mutating check if the condition of players bench is satisfied after the swap

        // More checks:
        // self user should own the "give" player
        // receiving user should own the "want" player
        // week should be the one after the current. if week is last then throw.

        // Sudo code:
        // 1. find the other user specified in second account be proposed in the array
        // 2. Write self pub key, give and want addr

        let league = root.get_leagues()?.get(args.get_league_id())?;
        let user_state = league.get_user_states()?.get(args.get_user_id())?;

        Self::validate_owner(program_id, &user_state.get_pub_key(), user_account_info)?;

        user_state
            .get_swap_proposals()?
            .add(args.get_give_player_id(), args.get_want_player_id())?;

        Ok(())
    }

    pub fn process_accept_swap<'a>(
        program_id: &Pubkey,
        accounts: &'a [AccountInfo<'a>],
        args: AcceptSwapArgs,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let root_info = next_account_info(account_info_iter)?;
        let root = Root::new(&root_info.data)?;

        let user_account_info = next_account_info(account_info_iter)?;

        // @TODO: before mutating check if the condition of players bench is satisfied after the swap

        // Sudo code
        // 1. Get the swap proposal
        // 2. Check if the want player exists with self user
        // 3. If it does then

        let league = root.get_leagues()?.get(args.get_league_id())?;
        let accepting_user_state = league
            .get_user_states()?
            .get(args.get_accepting_user_id())?;

        Self::validate_owner(
            program_id,
            &accepting_user_state.get_pub_key(),
            user_account_info,
        )?;

        let proposing_user = league
            .get_user_states()?
            .get(args.get_proposing_user_id())?;

        // Getting the swap proposal to work with
        let swap_proposal = proposing_user
            .get_swap_proposals()?
            .get(args.get_proposal_id())?;

        let want_player_id = swap_proposal.get_want_player_id();
        let want_player_index_accepting_user = accepting_user_state
            .get_user_players()?
            .index_of(want_player_id);

        if want_player_index_accepting_user.is_err() {
            return Err(SfsError::OwnerMismatch.into());
        }

        if accepting_user_state
            .get_lineups()?
            .get(root.get_current_week())?
            .contains(want_player_id)
        {
            return Err(SfsError::AlreadyInUse.into());
        }

        let give_player_id = swap_proposal.get_give_player_id();
        let give_player_index_proposing_user =
            proposing_user.get_user_players()?.index_of(give_player_id);

        if give_player_index_proposing_user.is_err() {
            return Err(SfsError::OwnerMismatch.into());
        }

        if proposing_user
            .get_lineups()?
            .get(root.get_current_week())?
            .contains(give_player_id)
        {
            return Err(SfsError::AlreadyInUse.into());
        }

        // Executing the swap
        accepting_user_state
            .get_user_players()?
            .set(want_player_index_accepting_user.unwrap(), give_player_id);
        proposing_user
            .get_user_players()?
            .set(give_player_index_proposing_user.unwrap(), want_player_id);

        Ok(())
    }

    /// Processes an [Instruction](enum.Instruction.html).
    pub fn process<'a>(
        program_id: &Pubkey,
        accounts: &'a [AccountInfo<'a>],
        instruction_data: &[u8],
    ) -> ProgramResult {
        let instruction_data = &RefCell::new(instruction_data);
        let instruction = SfsInstruction::unpack(instruction_data)?;

        match instruction {
            SfsInstruction::AddPlayers { args } => {
                info!("Instruction: AddPlayers");
                Self::process_add_players(program_id, accounts, args)
            }
            SfsInstruction::InitializeRoot { args } => {
                info!("Instruction: InitializeRoot");
                Self::process_initialize_root(program_id, accounts, args)
            }
            SfsInstruction::StartDraftSelection { args } => {
                info!("Instruction: StartDraftSelection");
                Self::process_start_draft_selection(program_id, accounts, args)
            }
            SfsInstruction::StartSeason => {
                info!("Instruction: StartSeason");
                Self::process_start_season(program_id, accounts)
            }
            SfsInstruction::UpdateLineup { args } => {
                info!("Instruction: UpdateLineup");
                Self::process_update_lineup(program_id, accounts, args)
            }
            SfsInstruction::PickPlayer { args } => {
                info!("Instruction: PickPlayer");
                Self::process_pick_player(program_id, accounts, args)
            }
            SfsInstruction::ProposeSwap { args } => {
                info!("Instruction: ProposeSwap");
                Self::process_propose_swap(program_id, accounts, args)
            }
            SfsInstruction::AcceptSwap { args } => {
                info!("Instruction: AcceptSwap");
                Self::process_accept_swap(program_id, accounts, args)
            }

            _ => return Err(SfsError::InvalidInstruction.into()),
        }
    }

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

    #[test]
    fn test_add_players() {
        let program_id = pubkey_rand();
        let root_key = pubkey_rand();
        let mut root_account = SolanaAccount::new(42, Root::LEN, &program_id);
        let mut rent_sysvar = rent_sysvar();

        let mut args_data = Vec::<u8>::new();
        args_data.extend_from_slice(&[5]);
        args_data.extend_from_slice(&[0, 1, 1]);
        args_data.extend_from_slice(&[0, 2, 2]);
        args_data.extend_from_slice(&[0, 3, 3]);
        args_data.extend_from_slice(&[0, 4, 4]);
        args_data.extend_from_slice(&[0, 5, 5]);
        for _ in 0..MAX_PLAYERS_PER_INSTRUCTION - 5 {
            args_data.extend_from_slice(&[0, 0, 0]);
        }

        let args_data = &RefCell::new(args_data.as_slice());
        let args = AddPlayersArgs::new(args_data, 0).unwrap();

        // add players
        do_process_instruction(
            add_players(&program_id, &root_key, args.clone()).unwrap(),
            vec![&mut root_account, &mut rent_sysvar],
        )
        .unwrap();

        let root_data = &RefCell::new(&mut *root_account.data);
        let root = Root::new(root_data).unwrap();
        assert_eq!(root.get_players().unwrap().get_count(), 5);
        assert_eq!(root.get_stage(), Ok(Stage::Uninitialized));
    }
}
