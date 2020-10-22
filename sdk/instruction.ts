import { PublicKey, TransactionInstruction, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';

import * as Layout from './util/layout';
import { BufferLayout } from './util/layout';
import { Player, PlayerLayout, TOTAL_PLAYERS_COUNT } from './state';

enum Command {
  InitializeRoot,
}

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
    players: Player[]
  ): TransactionInstruction {
    let keys = [
      { pubkey: root, isSigner: false, isWritable: true },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ];
    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      Layout.publicKey('oracleAuthority'),
      BufferLayout.seq(PlayerLayout, TOTAL_PLAYERS_COUNT, 'players'),
    ]);
    let data = Buffer.alloc(1024);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: Command.InitializeRoot,
          oracleAuthority: oracleAuthority.toBuffer(),
          players: players,
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
}
