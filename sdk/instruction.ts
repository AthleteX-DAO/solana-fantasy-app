import { PublicKey, TransactionInstruction, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';

import * as Layout from './util/layout';
import { BufferLayout } from './util/layout';
import {
  Position,
  PLAYERS_CAPACITY,
  MAX_PLAYERS_PER_INSTRUCTION,
  LEAGUE_NAME_UTF16_LEN,
} from './state';
import { stringify } from 'querystring';

enum Command {
  Uninitialized,
  AddPlayers,
  InitializeRoot,
  StartDraftSelection,
  StartSeason,
  CreateLeague,
  JoinLeague,
  UpdateLineup,
  PickPlayer,
  ProposeSwaps,
  AcceptSwap,
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
    oracleAuthority: PublicKey
  ): TransactionInstruction {
    let keys = [
      { pubkey: root, isSigner: false, isWritable: true },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ];
    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      Layout.publicKey('oracleAuthority'),
    ]);
    let data = Buffer.alloc(commandDataLayout.span);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: Command.InitializeRoot,
          oracleAuthority: oracleAuthority.toBuffer(),
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
   * Construct an CreateLeague instruction
   */
  static createCreateLeagueInstruction(
    programId: PublicKey,
    root: PublicKey,
    name: string,
    bid: number | Layout.u64,
    usersLimit: number,
    owner: PublicKey
  ): TransactionInstruction {
    let keys = [
      { pubkey: root, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
    ];
    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      BufferLayout.seq(BufferLayout.u16(), LEAGUE_NAME_UTF16_LEN, 'name'),
      Layout.uint64('bid'),
      BufferLayout.u8('usersLimit'),
    ]);

    if (name.length > LEAGUE_NAME_UTF16_LEN) throw new Error('Name is too big');

    let data = Buffer.alloc(commandDataLayout.span);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: Command.CreateLeague,
          name: name
            .padEnd(LEAGUE_NAME_UTF16_LEN, '\0')
            .split('')
            .map((x) => x.charCodeAt(0)),
          bid,
          usersLimit,
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
    leagueId: number,
    owner: PublicKey
  ): TransactionInstruction {
    let keys = [
      { pubkey: root, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
    ];
    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      BufferLayout.u16('leagueId'),
    ]);

    let data = Buffer.alloc(commandDataLayout.span);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: Command.JoinLeague,
          leagueId,
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
