//! State transition types

pub const MAX_PLAYERS_PER_INSTRUCTION: u16 = 255;
pub const PLAYERS_CAPACITY: u16 = 100;
pub const GAMES_COUNT: u8 = 17;
pub const ACTIVE_PLAYERS_COUNT: u8 = 3;
pub const BENCH_PLAYERS_COUNT: u8 = 3;
pub const TEAM_PLAYERS_COUNT: u8 = ACTIVE_PLAYERS_COUNT + BENCH_PLAYERS_COUNT;
pub const LEAGUES_CAPACITY: u16 = 10;
pub const LEAGUE_USERS_CAPACITY: u8 = (PLAYERS_CAPACITY / TEAM_PLAYERS_COUNT as u16) as u8;
pub const SWAP_PROPOSALS_CAPACITY: u8 = 20;

pub const LEAGUE_NAME_LEN: usize = 256;
pub const TEAM_NAME_LEN: usize = 256;

pub const PUB_KEY_LEN: usize = 32;

pub const MAX_QB: usize = 4;
pub const MAX_RB: usize = 8;
pub const MAX_WR: usize = 8;
pub const MAX_TE: usize = 3;
pub const MAX_K: usize = 3;
pub const MAX_D: usize = 3;
