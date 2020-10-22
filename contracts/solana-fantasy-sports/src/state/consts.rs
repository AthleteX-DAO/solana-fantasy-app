//! State transition types

pub const TOTAL_PLAYERS_COUNT: usize = 10;
pub const GAMES_COUNT: usize = 17;
pub const LEAGUES_COUNT: usize = 1;
pub const LEAGUE_USERS_COUNT: usize = 1;
pub const ACTIVE_PLAYERS_COUNT: usize = 8;
pub const BENCH_PLAYERS_COUNT: usize = 8;
pub const TEAM_PLAYERS_COUNT: usize = ACTIVE_PLAYERS_COUNT + BENCH_PLAYERS_COUNT;
pub const LINEUP_LEN: usize = 2 * ACTIVE_PLAYERS_COUNT;

pub const PUB_KEY_LEN: usize = 32;