import { BufferLayout } from './util/layout';
import { PublicKey } from '@solana/web3.js';

import * as Layout from './util/layout';

export const MAX_PLAYERS_PER_INSTRUCTION = 255;
export const PLAYERS_CAPACITY = 1000;
export const GAMES_COUNT = 17;
export const ACTIVE_PLAYERS_COUNT = 8;
export const BENCH_PLAYERS_COUNT = 8;
export const TEAM_PLAYERS_COUNT = ACTIVE_PLAYERS_COUNT + BENCH_PLAYERS_COUNT;
export const LEAGUES_CAPACITY = 100;
export const LEAGUE_USERS_CAPACITY = Math.floor(PLAYERS_CAPACITY / TEAM_PLAYERS_COUNT);
export const SWAP_PROPOSALS_CAPACITY = 20;

export const LEAGUE_NAME_LEN = 256;
export const LEAGUE_NAME_UTF16_LEN = 128;

export const PUB_KEY_LEN = 32;

export enum Position {
  Uninitialized,
  RB,
  LB,
  DL,
  TE,
  DB,
  QB,
  WR,
  OL,
}

export enum Stage {
  Uninitialized,
  Join,
  DraftSelection,
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
  BufferLayout.u8('isInitialized'),
]);

export type UserState = {
  bench: number[];
  lineups: number[][];
  swapProposalsLength: number;
  swapProposals: SwapProposal[];
  pubKey: PublicKey;
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
  Layout.publicKey('pubKey'),
  BufferLayout.u8('isInitialized'),
]);

export type League = {
  userStateLength: number;
  userStates: UserState[];
  name: number[];
  bid: number;
  usersLimit: number;
  currentPick: number;
  isInitialized: boolean;
};

export const LeagueLayout: typeof BufferLayout.Structure = BufferLayout.struct([
  BufferLayout.u8('userStateLength'),
  BufferLayout.seq(UserStateLayout, LEAGUE_USERS_CAPACITY, 'userStates'),
  BufferLayout.seq(BufferLayout.u16(), LEAGUE_NAME_UTF16_LEN, 'name'),
  Layout.uint64('bid'),
  BufferLayout.u8('usersLimit'),
  BufferLayout.u16('currentPick'),
  BufferLayout.u8('isInitialized'),
]);

export type Score = {
  score1: number;
  isInitialized: boolean;
};

export const ScoreLayout: typeof BufferLayout.Structure = BufferLayout.struct([
  BufferLayout.u8('score1'),
  BufferLayout.u8('isInitialized'),
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
  BufferLayout.u8('isInitialized'),
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
