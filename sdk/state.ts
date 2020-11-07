import { BufferLayout, u64 } from './util/layout';
import { PublicKey } from '@solana/web3.js';

import * as Layout from './util/layout';

export const MAX_PLAYERS_SCORES_PER_TRANSACTION = 50;
export const MAX_PLAYERS_PER_INSTRUCTION = 255;
export const PLAYERS_CAPACITY = 100;
export const GAMES_COUNT = 17;
export const ACTIVE_PLAYERS_COUNT = 3;
export const BENCH_PLAYERS_COUNT = 3;
export const TEAM_PLAYERS_COUNT = ACTIVE_PLAYERS_COUNT + BENCH_PLAYERS_COUNT;
export const LEAGUES_CAPACITY = 10;
export const LEAGUE_USERS_CAPACITY = Math.floor(PLAYERS_CAPACITY / TEAM_PLAYERS_COUNT);
export const SWAP_PROPOSALS_CAPACITY = 20;

export const LEAGUE_NAME_LEN = 256;
export const LEAGUE_NAME_MAX_SYMBOLS = 128;

export const TEAM_NAME_LEN = 256;
export const TEAM_NAME_MAX_SYMBOLS = 128;

export const PUB_KEY_LEN = 32;

export enum Position {
  Uninitialized,
  RB,
  //  WR
  WR,
  //  Q
  QB,
  //  TE
  TE,
  // K
  K,
  //  DEF
  DEF,
}

export enum Stage {
  Uninitialized,
  SeasonOpen,
  SeasonComplete,
}

export type SwapProposal = {
  givePlayerId: number;
  wantPlayerId: number;
  isInitialized: boolean;
};

export const SwapProposalLayout: typeof BufferLayout.Structure = BufferLayout.struct([
  BufferLayout.u16('givePlayerId'),
  BufferLayout.u16('wantPlayerId'),
  Layout.boolean('isInitialized'),
]);

export type UserState = {
  userPlayers: number[];
  lineups: number[][];
  swapProposalsCount: number;
  swapProposals: SwapProposal[];
  teamName: string;
  pubKey: PublicKey;
  isLineupSet: boolean;
  isInitialized: boolean;
};

export const UserStateLayout: typeof BufferLayout.Structure = BufferLayout.struct([
  BufferLayout.seq(BufferLayout.u16(), TEAM_PLAYERS_COUNT, 'userPlayers'),
  BufferLayout.seq(
    BufferLayout.seq(BufferLayout.u16(), ACTIVE_PLAYERS_COUNT),
    GAMES_COUNT,
    'lineups'
  ),
  BufferLayout.u8('swapProposalsCount'),
  BufferLayout.seq(SwapProposalLayout, SWAP_PROPOSALS_CAPACITY, 'swapProposals'),
  Layout.utf16FixedString(TEAM_NAME_MAX_SYMBOLS, 'teamName'),
  Layout.publicKey('pubKey'),
  Layout.boolean('isLineupSet'),
  Layout.boolean('isInitialized'),
]);

export type League = {
  userStateCount: number;
  userStates: UserState[];
  name: string;
  bid: u64;
  usersLimit: number;
  currentPick: number;
  startWeek: number;
  isRewardClaimed: boolean;
  isInitialized: boolean;
};

export const LeagueLayout: typeof BufferLayout.Structure = BufferLayout.struct([
  BufferLayout.u8('userStateCount'),
  BufferLayout.seq(UserStateLayout, LEAGUE_USERS_CAPACITY, 'userStates'),
  Layout.utf16FixedString(LEAGUE_NAME_MAX_SYMBOLS, 'name'),
  Layout.uint64('bid'),
  BufferLayout.u8('usersLimit'),
  BufferLayout.u16('currentPick'),
  BufferLayout.u8('startWeek'),
  Layout.boolean('isRewardClaimed'),
  Layout.boolean('isInitialized'),
]);

export type Score = {
  score1: number;
  isInitialized: boolean;
};

export const ScoreLayout: typeof BufferLayout.Structure = BufferLayout.struct([
  BufferLayout.u16('score1'),
  Layout.boolean('isInitialized'),
]);

export type Player = {
  scores: Score[];
  externalId: number;
  position: Position;
  isInitialized: boolean;
};

export const PlayerLayout: typeof BufferLayout.Structure = BufferLayout.struct([
  BufferLayout.seq(ScoreLayout, GAMES_COUNT, 'scores'),
  BufferLayout.u16('externalId'),
  BufferLayout.u8('position'),
  Layout.boolean('isInitialized'),
]);

export type Root = {
  /// An address of an account that stores the latest state.
  playersCount: number;
  players: Player[];
  /// Leagues
  leaguesCount: number;
  leagues: League[];
  pickOrder: number[];
  stage: Stage;
  currentWeek: number;
  /// Oracle authority used to supply game scores.
  oracleAuthority: PublicKey;
};

export const RootLayout: typeof BufferLayout.Structure = BufferLayout.struct([
  BufferLayout.u16('playersCount'),
  BufferLayout.seq(PlayerLayout, PLAYERS_CAPACITY, 'players'),
  BufferLayout.u16('leaguesCount'),
  BufferLayout.seq(LeagueLayout, LEAGUES_CAPACITY, 'leagues'),
  BufferLayout.seq(BufferLayout.u8(), LEAGUE_USERS_CAPACITY, 'pickOrder'),
  BufferLayout.u8('stage'),
  BufferLayout.u8('currentWeek'),
  Layout.publicKey('oracleAuthority'),
]);
