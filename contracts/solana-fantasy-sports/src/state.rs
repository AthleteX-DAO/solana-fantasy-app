//! State transition types

use std::mem;
use byteorder::{ByteOrder, LittleEndian};
use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};
use num_enum::TryFromPrimitive;
use solana_sdk::{
    program_error::ProgramError,
    program_option::COption,
    program_pack::{IsInitialized, Pack, Sealed},
    pubkey::Pubkey,
};

const TOTAL_PLAYERS_COUNT: usize = 3989;
const GAMES_COUNT: usize = 17;
const LEAGUES_COUNT: usize = 10;
const LEAGUE_USERS_COUNT: usize = 10;
const ACTIVE_PLAYERS_COUNT: usize = 8;
const BENCH_PLAYERS_COUNT: usize = 8;
const TEAM_PLAYERS_COUNT: usize = ACTIVE_PLAYERS_COUNT + BENCH_PLAYERS_COUNT;
const LINEUP_LEN: usize = 2 * ACTIVE_PLAYERS_COUNT;

const PUB_KEY_LEN: usize = 32;

/// Root data.
#[repr(C)]
#[derive(Clone, Debug, PartialEq)]
pub struct Root {
    /// Oracle authority used to supply game scores.
    pub oracle_authority: COption<Pubkey>,
    /// An address of an account that stores the latest state.
    pub players: Vec<Player>,
    /// Leagues
    pub leagues: [League; LEAGUES_COUNT],
    /// Is `true` if this structure has been initialized
    pub is_initialized: bool,
}
impl Sealed for Root {}
impl IsInitialized for Root {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}
impl Default for Root {
    #[inline]
    fn default() -> Self {
        Self {
            oracle_authority: COption::None,
            players: vec![Player::default(); TOTAL_PLAYERS_COUNT],
            leagues: [League::default(); LEAGUES_COUNT],
            is_initialized: false
        }
    }
}
impl Pack for Root {
    const LEN: usize = 36 + Player::LEN * TOTAL_PLAYERS_COUNT + League::LEN * LEAGUES_COUNT + 1;
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, Root::LEN];
        let (oracle_authority, players_src, leagues_src, is_initialized) =
            array_refs![src,
                36,
                Player::LEN * TOTAL_PLAYERS_COUNT,
                League::LEN * LEAGUES_COUNT,
                1
            ];
        let oracle_authority = unpack_coption_key(oracle_authority)?;
        let mut players = vec![Player::default(); TOTAL_PLAYERS_COUNT];
        for i in 0..TOTAL_PLAYERS_COUNT {
            let player_src = array_ref!(players_src, i * Player::LEN, Player::LEN);
            players[i] = Player::unpack_from_slice(player_src).unwrap();
        }
        let mut leagues = [League::default(); LEAGUES_COUNT];
        for i in 0..LEAGUES_COUNT {
            let league_src = array_ref!(leagues_src, i * League::LEN, League::LEN);
            leagues[i] = League::unpack_from_slice(league_src).unwrap();
        }
        let is_initialized = match is_initialized {
            [0] => false,
            [1] => true,
            _ => return Err(ProgramError::InvalidAccountData),
        };
        Ok(Root {
            oracle_authority,
            players,
            leagues,
            is_initialized,
        })
    }
    fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = array_mut_ref![dst, 0, Root::LEN];
        let (
            oracle_authority_dst,
            players_dst,
            leagues_dst,
            is_initialized_dst,
        ) = mut_array_refs![dst,
                36,
                Player::LEN * TOTAL_PLAYERS_COUNT,
                League::LEN * LEAGUES_COUNT,
                1
            ];
        let &Root {
            ref oracle_authority,
            ref players,
            leagues,
            is_initialized,
        } = self;
        pack_coption_key(oracle_authority, oracle_authority_dst);
        for i in 0..TOTAL_PLAYERS_COUNT {
            let player_dst = array_mut_ref!(players_dst, i * Player::LEN, Player::LEN);
            Player::pack_into_slice(&players[i], players_dst);
        }
        for i in 0..LEAGUES_COUNT {
            let league_dst = array_mut_ref!(leagues_dst, i * League::LEN, League::LEN);
            League::pack_into_slice(&leagues[i], league_dst);
        }
        is_initialized_dst[0] = is_initialized as u8;
    }
}

/// Player data.
#[repr(C)]
#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct Score {
    /// score
    pub score1: u8,
    /* TODO: more scores here */

    /// Is `true` if this structure has been initialized
    pub is_initialized: bool,
}
impl Sealed for Score {}
impl IsInitialized for Score {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}
impl Pack for Score {
    const LEN: usize = 2;
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, Score::LEN];
        let (score1, /* TODO: more scores here */ is_initialized) =
            array_refs![src, 1, 1];
        /* TODO: more scores here */
        let is_initialized = match is_initialized {
            [0] => false,
            [1] => true,
            _ => return Err(ProgramError::InvalidAccountData),
        };
        Ok(Score {
            score1: score1[0],
            is_initialized,
        })
    }
    fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = array_mut_ref![dst, 0, Score::LEN];
        let (
            score1_dst,
            /* TODO: more scores here */
            is_initialized_dst,
        ) = mut_array_refs![dst, 1, 1];
        let &Score {
            score1,
            is_initialized,
        } = self;
        score1_dst[0] = score1;
        is_initialized_dst[0] = is_initialized as u8;
    }
}

/// Player data.
#[repr(C)]
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Player {
    /// Player name.
    pub id: u16,
    pub position: Position,
    pub scores: [Score; GAMES_COUNT],
    /// Is `true` if this structure has been initialized
    pub is_initialized: bool,
}
impl Sealed for Player {}
impl IsInitialized for Player {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}
impl Default for Player {
    #[inline]
    fn default() -> Self {
        Self {
            id: 0u16,
            position: Position::Uninitialized,
            scores: [Score::default(); GAMES_COUNT],
            is_initialized: false
        }
    }
}
impl Pack for Player {
    const LEN: usize = 2 + 1 + GAMES_COUNT * Score::LEN + 1;
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, Player::LEN];
        let (id, position, scores_src, is_initialized) =
            array_refs![src, 2, 1, GAMES_COUNT * Score::LEN, 1];
        let is_initialized = match is_initialized {
            [0] => false,
            [1] => true,
            _ => return Err(ProgramError::InvalidAccountData),
        };
        let mut scores = [Score::default(); GAMES_COUNT];
        for i in 0..GAMES_COUNT {
            let score_src = array_ref!(scores_src, i * Score::LEN, Score::LEN);
            scores[i] = Score::unpack_from_slice(score_src).unwrap();
        }
        Ok(Player {
            id: LittleEndian::read_u16(id),
            position: Position::try_from_primitive(position[0])
                .or(Err(ProgramError::InvalidAccountData))?,
            scores,
            is_initialized,
        })
    }
    fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = array_mut_ref![dst, 0, Player::LEN];
        let (
            id_dst,
            position_dst,
            scores_dst,
            is_initialized_dst,
        ) = mut_array_refs![dst, 2, 1, GAMES_COUNT * Score::LEN, 1];
        let &Player {
            id,
            position,
            ref scores,
            is_initialized,
        } = self;
        LittleEndian::write_u16(id_dst, id);
        for i in 0..GAMES_COUNT {
            let score_dst = array_mut_ref!(scores_dst, i * Score::LEN, Score::LEN);
            scores[i].pack_into_slice(score_dst);
        }
        is_initialized_dst[0] = is_initialized as u8;
    }
}


/// User data.
#[repr(C)]
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct UserState {
    /// Player name.
    pub pub_key: Pubkey,
    pub bench: [u16;TEAM_PLAYERS_COUNT],
    pub lineups: [[u16;ACTIVE_PLAYERS_COUNT];GAMES_COUNT],
    /// Is `true` if this structure has been initialized
    pub is_initialized: bool,
}
impl Sealed for UserState {}
impl IsInitialized for UserState {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}
impl Default for UserState {
    #[inline]
    fn default() -> Self {
        Self {
            pub_key: Pubkey::default(),
            bench: [0u16; TEAM_PLAYERS_COUNT],
            lineups: [[0u16;ACTIVE_PLAYERS_COUNT];GAMES_COUNT],
            is_initialized: false
        }
    }
}
impl Pack for UserState {
    const LEN: usize = PUB_KEY_LEN
        + 2 * TEAM_PLAYERS_COUNT
        + 2 * ACTIVE_PLAYERS_COUNT * GAMES_COUNT
        + 1;
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, UserState::LEN];
        let (pub_key, bench_src, lineups_src, is_initialized) =
            array_refs![
                src,
                PUB_KEY_LEN,
                2 * TEAM_PLAYERS_COUNT,
                2 * ACTIVE_PLAYERS_COUNT * GAMES_COUNT,
                1
            ];
        let mut bench = [0u16; TEAM_PLAYERS_COUNT];
        for i in 0..TEAM_PLAYERS_COUNT {
            bench[i] = LittleEndian::read_u16(array_ref!(bench_src, i * 2, 2));
        }
        let mut lineups = [[0u16;ACTIVE_PLAYERS_COUNT];GAMES_COUNT];
        for i in 0..GAMES_COUNT {
            let lineup_src = array_ref!(lineups_src, i * LINEUP_LEN, LINEUP_LEN);
            for j in 0..ACTIVE_PLAYERS_COUNT {
                lineups[i][j] = LittleEndian::read_u16(array_ref!(lineup_src, j * 2, 2));
            }
        }
        let is_initialized = match is_initialized {
            [0] => false,
            [1] => true,
            _ => return Err(ProgramError::InvalidAccountData),
        };
        Ok(UserState {
            pub_key: Pubkey::new_from_array(*pub_key),
            bench,
            lineups,
            is_initialized,
        })
    }
    fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = array_mut_ref![dst, 0, UserState::LEN];
        let (
            pub_key_dst,
            bench_dst,
            lineups_dst,
            is_initialized_dst,
        ) = mut_array_refs![
            dst,
            PUB_KEY_LEN,
            2 * TEAM_PLAYERS_COUNT,
            2 * ACTIVE_PLAYERS_COUNT * GAMES_COUNT,
            1
        ];
        let &UserState {
            ref pub_key,
            bench,
            lineups,
            is_initialized,
        } = self;
        pub_key_dst.copy_from_slice(pub_key.as_ref());
        for i in 0..TEAM_PLAYERS_COUNT {
            LittleEndian::write_u16(array_mut_ref!(bench_dst, i * 2, 2), bench[i]);
        }
        let lineups = [[0u16;ACTIVE_PLAYERS_COUNT];GAMES_COUNT];
        for i in 0..GAMES_COUNT {
            let mut lineup_dst = array_mut_ref!(lineups_dst, i * LINEUP_LEN, LINEUP_LEN);
            for j in 0..ACTIVE_PLAYERS_COUNT {
                LittleEndian::write_u16(array_mut_ref!(lineup_dst, j * 2, 2), lineups[i][j]);
            }
        }
        is_initialized_dst[0] = is_initialized as u8;
    }
}

/// League data.
#[repr(C)]
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct League {
    /// Bid
    pub bid: u8,
    /// Users
    pub user_states: [UserState; LEAGUE_USERS_COUNT],
    /// Is `true` if this structure has been initialized
    pub is_initialized: bool,
}
impl Sealed for League {}
impl IsInitialized for League {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}
impl Default for League {
    #[inline]
    fn default() -> Self {
        Self {
            bid: 0,
            user_states: [UserState::default(); LEAGUE_USERS_COUNT],
            is_initialized: false
        }
    }
}
impl Pack for League {
    const LEN: usize = 1 + UserState::LEN * LEAGUE_USERS_COUNT + 1;
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, League::LEN];
        let (bid, user_states_src, is_initialized) =
            array_refs![src, 1, UserState::LEN * LEAGUE_USERS_COUNT , 1];
        let is_initialized = match is_initialized {
            [0] => false,
            [1] => true,
            _ => return Err(ProgramError::InvalidAccountData),
        };
        let mut user_states = [UserState::default(); LEAGUE_USERS_COUNT];
        for i in 0..LEAGUE_USERS_COUNT {
            let user_state_src = array_ref!(user_states_src, i * UserState::LEN, UserState::LEN);
            user_states[i] = UserState::unpack_from_slice(user_state_src).unwrap();
        }
        Ok(League {
            bid: bid[0],
            user_states,
            is_initialized,
        })
    }
    fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = array_mut_ref![dst, 0, League::LEN];
        let (
            bid_dst,
            user_states_dst,
            is_initialized_dst,
        ) = mut_array_refs![dst, 1, UserState::LEN * LEAGUE_USERS_COUNT , 1];
        let &League {
            bid,
            ref user_states,
            is_initialized,
        } = self;
        bid_dst[0] = bid;
        for i in 0..LEAGUE_USERS_COUNT {
            let user_state_dst = array_mut_ref!(user_states_dst, i * UserState::LEN, UserState::LEN);
            user_states[i].pack_into_slice(user_state_dst);
        }
        is_initialized_dst[0] = is_initialized as u8;
    }
}

/// Position state.
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, TryFromPrimitive)]
pub enum Position {
    /// Not yet initialized
    Uninitialized,
    /// RB
    RB,
    /// LB
    LB,
    /// DL
    DL,
    /// TE
    TE,
    /// DB
    DB,
    /// QB
    QB,
    /// WR
    WR,
    /// OL
    OL,
}
impl Default for Position {
    fn default() -> Self {
        Position::Uninitialized
    }
}

// Helpers
fn pack_coption_key(src: &COption<Pubkey>, dst: &mut [u8; 36]) {
    let (tag, body) = mut_array_refs![dst, 4, 32];
    match src {
        COption::Some(key) => {
            *tag = [1, 0, 0, 0];
            body.copy_from_slice(key.as_ref());
        }
        COption::None => {
            *tag = [0; 4];
        }
    }
}
fn unpack_coption_key(src: &[u8; 36]) -> Result<COption<Pubkey>, ProgramError> {
    let (tag, body) = array_refs![src, 4, 32];
    match *tag {
        [0, 0, 0, 0] => Ok(COption::None),
        [1, 0, 0, 0] => Ok(COption::Some(Pubkey::new_from_array(*body))),
        _ => Err(ProgramError::InvalidAccountData),
    }
}
fn pack_coption_u64(src: &COption<u64>, dst: &mut [u8; 12]) {
    let (tag, body) = mut_array_refs![dst, 4, 8];
    match src {
        COption::Some(amount) => {
            *tag = [1, 0, 0, 0];
            *body = amount.to_le_bytes();
        }
        COption::None => {
            *tag = [0; 4];
        }
    }
}
fn unpack_coption_u64(src: &[u8; 12]) -> Result<COption<u64>, ProgramError> {
    let (tag, body) = array_refs![src, 4, 8];
    match *tag {
        [0, 0, 0, 0] => Ok(COption::None),
        [1, 0, 0, 0] => Ok(COption::Some(u64::from_le_bytes(*body))),
        _ => Err(ProgramError::InvalidAccountData),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::instruction::*;
    use solana_sdk::{
        account::Account as SolanaAccount, account_info::create_is_signer_account_infos,
        clock::Epoch, instruction::Instruction, sysvar::rent,
    };

    // #[test]
    // fn test_pack_unpack() {
    //     // Root
    //     let check = Root {
    //         oracle_authority: COption::Some(Pubkey::new(&[1; 32])),
    //         players:
    //         latest_state_account: Pubkey::new(&[2; 32]),
    //         is_initialized: true,
    //     };
    //     let mut packed = vec![0; Root::get_packed_len() + 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         Root::pack(check, &mut packed)
    //     );
    //     let mut packed = vec![0; Root::get_packed_len() - 1];
    //     assert_eq!(
    //         Err(ProgramError::InvalidAccountData),
    //         Root::pack(check, &mut packed)
    //     );
    //     let mut packed = vec![0; Root::get_packed_len()];
    //     Root::pack(check, &mut packed).unwrap();
    //     let mut expect = vec![1, 0, 0, 0];
    //     expect.extend_from_slice(&[1u8; 32]);
    //     expect.extend_from_slice(&[2u8; 32]);
    //     expect.extend_from_slice(&[1u8]);
    //     assert_eq!(packed, expect);
    //     let unpacked = Root::unpack(&packed).unwrap();
    //     assert_eq!(unpacked, check);
    // }
}
