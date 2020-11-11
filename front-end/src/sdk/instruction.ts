import {
  PublicKey,
  TransactionInstruction,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
} from '@solana/web3.js';

import * as Layout from './util/layout';
import { BufferLayout } from './util/layout';
import { ACTIVE_PLAYERS_COUNT, TEAM_NAME_MAX_SYMBOLS } from './state';
import {
  Position,
  MAX_PLAYERS_PER_INSTRUCTION,
  LEAGUE_NAME_MAX_SYMBOLS,
  LEAGUE_USERS_CAPACITY,
} from './state';

enum Command {
  Uninitialized,
  AddPlayers,
  InitializeRoot,
  SeedDraftSelection,
  StartSeason,
  CreateLeague,
  JoinLeague,
  UpdateLineup,
  PickPlayer,
  ProposeSwap,
  AcceptSwap,
  RejectSwap,
  UpdatePlayerScore,
  IncrementWeek,
  ClaimReward,
}

export type Player = {
  externalId: number;
  position: Position;
};

export const PlayerLayout: typeof BufferLayout.Structure = BufferLayout.struct([
  BufferLayout.u16('externalId'),
  BufferLayout.u8('position'),
]);

export class SfsInstruction {
  /**
   * Construct an InitializeRoot instruction
   *
   * @param programId SFS program account
   * @param root SFS root account
   * @param oracleAuthority Oracle authority
   */
  static createInitializeRootInstruction(
    programId: PublicKey,
    root: PublicKey,
    oracleAuthority: PublicKey,
    currentWeek: number
  ): TransactionInstruction {
    let keys = [
      { pubkey: root, isSigner: false, isWritable: true },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ];
    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      Layout.publicKey('oracleAuthority'),
      BufferLayout.u8('currentWeek'),
    ]);
    let data = Buffer.alloc(commandDataLayout.span);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: Command.InitializeRoot,
          oracleAuthority,
          currentWeek,
        },
        data
      );
      data = data.slice(0, encodeLength);
    }

    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }

  /**
   * Construct an AddPlayers instruction
   *
   * @param programId SFS program account
   * @param root SFS root account
   * @param players players
   */
  static createAddPlayersInstruction(
    programId: PublicKey,
    root: PublicKey,
    players: Player[]
  ): TransactionInstruction {
    let keys = [{ pubkey: root, isSigner: false, isWritable: true }];
    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      BufferLayout.u8('length'),
      BufferLayout.seq(PlayerLayout, MAX_PLAYERS_PER_INSTRUCTION, 'players'),
    ]);
    let data = Buffer.alloc(commandDataLayout.span);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: Command.AddPlayers,
          length: players.length,
          players: players,
        },
        data
      );
    }

    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }

  /**
   * Construct an SeedDraftSelection instruction
   *
   * @param programId SFS program account
   * @param root SFS root account
   * @param pickOrder pick order seed
   */
  static createSeedDraftSelectionInstruction(
    programId: PublicKey,
    root: PublicKey,
    pickOrder: number[]
  ): TransactionInstruction {
    let keys = [{ pubkey: root, isSigner: false, isWritable: true }];
    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      BufferLayout.seq(BufferLayout.u8(), LEAGUE_USERS_CAPACITY, 'pickOrder'),
    ]);
    let data = Buffer.alloc(commandDataLayout.span);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: Command.SeedDraftSelection,
          pickOrder,
        },
        data
      );
    }

    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }

  /**
   * Construct an CreateLeague instruction
   */
  static createCreateLeagueInstruction(
    programId: PublicKey,
    root: PublicKey,
    bank: PublicKey,
    name: string,
    bid: number | Layout.u64,
    usersLimit: number,
    teamName: string,
    owner: PublicKey
  ): TransactionInstruction {
    let keys = [
      { pubkey: root, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: true },
      { pubkey: bank, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ];
    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      Layout.utf16FixedString(LEAGUE_NAME_MAX_SYMBOLS, 'name'),
      Layout.uint64('bid'),
      BufferLayout.u8('usersLimit'),
      Layout.utf16FixedString(TEAM_NAME_MAX_SYMBOLS, 'teamName'),
    ]);

    let data = Buffer.alloc(commandDataLayout.span);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: Command.CreateLeague,
          name,
          bid,
          usersLimit,
          teamName,
        },
        data
      );
    }

    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }

  /**
   * Construct an JoinLeague instruction
   */
  static createJoinLeagueInstruction(
    programId: PublicKey,
    root: PublicKey,
    bank: PublicKey,
    leagueIndex: number,
    teamName: string,
    owner: PublicKey
  ): TransactionInstruction {
    let keys = [
      { pubkey: root, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: true },
      { pubkey: bank, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ];
    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      BufferLayout.u16('leagueIndex'),
      Layout.utf16FixedString(TEAM_NAME_MAX_SYMBOLS, 'teamName'),
    ]);

    let data = Buffer.alloc(commandDataLayout.span);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: Command.JoinLeague,
          leagueIndex,
          teamName,
        },
        data
      );
    }

    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }

  /**
   * Construct an PickPlayer instruction
   */
  static createPickPlayerInstruction(
    programId: PublicKey,
    root: PublicKey,
    leagueIndex: number,
    userId: number,
    playerId: number,
    owner: PublicKey
  ): TransactionInstruction {
    let keys = [
      { pubkey: root, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
    ];
    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      BufferLayout.u16('leagueIndex'),
      BufferLayout.u8('userId'),
      BufferLayout.u16('playerId'),
    ]);

    let data = Buffer.alloc(commandDataLayout.span);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: Command.PickPlayer,
          leagueIndex,
          userId,
          playerId,
        },
        data
      );
    }

    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }
  /**
   * Construct an UpdatePlayerScore instruction
   */
  static createUpdatePlayerScoreInstruction(
    programId: PublicKey,
    root: PublicKey,
    bank: PublicKey,
    playerId: number,
    playerScore: number,
    owner: PublicKey
  ): TransactionInstruction {
    let keys = [
      { pubkey: root, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
      { pubkey: bank, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ];
    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      BufferLayout.u16('playerId'),
      BufferLayout.u16('playerScore'),
    ]);

    let data = Buffer.alloc(commandDataLayout.span);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: Command.UpdatePlayerScore,
          playerId,
          playerScore,
        },
        data
      );
    }

    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }
  /**
   * Construct an IncrementWeek instruction
   */
  static createIncrementWeekInstruction(
    programId: PublicKey,
    root: PublicKey,
    bank: PublicKey,
    owner: PublicKey
  ): TransactionInstruction {
    let keys = [
      { pubkey: root, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
      { pubkey: bank, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ];
    const commandDataLayout = BufferLayout.struct([BufferLayout.u8('instruction')]);

    let data = Buffer.alloc(commandDataLayout.span);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: Command.IncrementWeek,
        },
        data
      );
    }

    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }
  /**
   * Construct an UpdateLineup instruction
   */
  static createUpdateLineupInstruction(
    programId: PublicKey,
    root: PublicKey,
    leagueIndex: number,
    userId: number,
    week: number,
    activePlayers: number[],
    owner: PublicKey
  ): TransactionInstruction {
    let keys = [
      { pubkey: root, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
    ];
    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      BufferLayout.seq(BufferLayout.u16(), ACTIVE_PLAYERS_COUNT, 'activePlayers'),
      BufferLayout.u16('leagueIndex'),
      BufferLayout.u8('userId'),
      BufferLayout.u16('week'),
    ]);

    let data = Buffer.alloc(commandDataLayout.span);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: Command.UpdateLineup,
          activePlayers,
          leagueIndex,
          userId,
          week,
        },
        data
      );
    }

    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }
  /**
   * Construct an ProposeSwap instruction
   */
  static createProposeSwapInstruction(
    programId: PublicKey,
    root: PublicKey,
    leagueIndex: number,
    proposingUserId: number,
    acceptingUserId: number,
    givePlayerId: number,
    wantPlayerId: number,
    owner: PublicKey
  ): TransactionInstruction {
    let keys = [
      { pubkey: root, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
    ];
    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      BufferLayout.u16('leagueIndex'),
      BufferLayout.u8('proposingUserId'),
      BufferLayout.u8('acceptingUserId'),
      BufferLayout.u16('givePlayerId'),
      BufferLayout.u16('wantPlayerId'),
    ]);

    let data = Buffer.alloc(commandDataLayout.span);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: Command.ProposeSwap,
          leagueIndex,
          proposingUserId,
          acceptingUserId,
          givePlayerId,
          wantPlayerId,
        },
        data
      );
    }

    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }
  /**
   * Construct an AcceptSwap instruction
   */
  static createAcceptSwapInstruction(
    programId: PublicKey,
    root: PublicKey,
    leagueIndex: number,
    acceptingUserId: number,
    proposingUserId: number,
    wantPlayerId: number,
    givePlayerId: number,
    owner: PublicKey
  ): TransactionInstruction {
    let keys = [
      { pubkey: root, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
    ];
    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      BufferLayout.u16('leagueIndex'),
      BufferLayout.u8('acceptingUserId'),
      BufferLayout.u8('proposingUserId'),
      BufferLayout.u16('givePlayerId'),
      BufferLayout.u16('wantPlayerId'),
    ]);

    let data = Buffer.alloc(commandDataLayout.span);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: Command.AcceptSwap,
          leagueIndex,
          proposingUserId,
          acceptingUserId,
          givePlayerId,
          wantPlayerId,
        },
        data
      );
    }

    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }
  /**
   * Construct an RejectSwap instruction
   */
  static createRejectSwapInstruction(
    programId: PublicKey,
    root: PublicKey,
    leagueIndex: number,
    acceptingUserId: number,
    proposingUserId: number,
    wantPlayerId: number,
    givePlayerId: number,
    owner: PublicKey
  ): TransactionInstruction {
    let keys = [
      { pubkey: root, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
    ];
    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      BufferLayout.u16('leagueIndex'),
      BufferLayout.u8('acceptingUserId'),
      BufferLayout.u8('proposingUserId'),
      BufferLayout.u16('givePlayerId'),
      BufferLayout.u16('wantPlayerId'),
    ]);

    let data = Buffer.alloc(commandDataLayout.span);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: Command.RejectSwap,
          leagueIndex,
          proposingUserId,
          acceptingUserId,
          givePlayerId,
          wantPlayerId,
        },
        data
      );
    }

    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }
  /**
   * Construct an ClaimReward instruction
   */
  static createClaimRewardInstruction(
    programId: PublicKey,
    root: PublicKey,
    bank: PublicKey,
    leagueIndex: number,
    winners: PublicKey[]
  ): TransactionInstruction {
    let keys = [
      { pubkey: root, isSigner: false, isWritable: true },
      { pubkey: bank, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ...winners.map((x) => ({ pubkey: x, isSigner: false, isWritable: true })),
    ];
    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      BufferLayout.u16('leagueIndex'),
    ]);

    let data = Buffer.alloc(commandDataLayout.span);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: Command.ClaimReward,
          leagueIndex,
        },
        data
      );
    }

    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }
}
