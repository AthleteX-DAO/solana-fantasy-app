import { Account, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import type { Connection } from '@solana/web3.js';

import { sendAndConfirmTransaction } from './util/send-and-confirm-transaction';
import { MAX_PLAYERS_PER_INSTRUCTION, Player, Root, RootLayout } from './state';
import { SfsInstruction, Player as PlayerInit } from './instruction';

// The address of the special mint for wrapped native token.
export const NATIVE_MINT: PublicKey = new PublicKey('So11111111111111111111111111111111111111112');

/**
 * SolanaFantasySport
 */
export class SFS {
  /**
   * Create a SFS object attached to the specific root
   *
   * @param connection The connection to use
   * @param token Public key of the root account
   * @param programId SFS programId
   * @param payer Payer of fees
   */
  constructor(
    private connection: Connection,
    /**
     * The public key of root account
     */
    private publicKey: PublicKey,
    /**
     * Program Identifier for the SFS program
     */
    private programId: PublicKey
  ) {}

  /**
   * Get the minimum balance for the root to be rent exempt
   *
   * @return Number of lamports required
   */
  static async getMinBalanceRentForExemptRoot(connection: Connection): Promise<number> {
    return await connection.getMinimumBalanceForRentExemption(RootLayout.span);
  }

  /**
   * Create and initialize a token.
   *
   * @param connection The connection to use
   * @param payer Fee payer for transaction
   * @param oracleAuthority Account or multisig that will control scores
   * @param programId Optional sfs programId, uses the system programId by default
   * @return SFS object for the newly created root
   */
  static async initializeRoot(
    connection: Connection,
    payer: Account,
    oracleAuthority: PublicKey,
    players: PlayerInit[],
    programId: PublicKey
  ): Promise<SFS> {
    const rootAccount = new Account();
    const sfs = new SFS(connection, rootAccount.publicKey, programId);

    // Allocate memory for the account
    const balanceNeeded = await SFS.getMinBalanceRentForExemptRoot(connection);

    let transaction = new Transaction()
      .add(
        SystemProgram.createAccount({
          fromPubkey: payer.publicKey,
          newAccountPubkey: rootAccount.publicKey,
          lamports: balanceNeeded,
          space: RootLayout.span,
          programId,
        })
      );

    await sendAndConfirmTransaction(
      'Create account',
      connection,
      transaction,
      payer,
      rootAccount
    );

    for (let i = 0; i < players.length / MAX_PLAYERS_PER_INSTRUCTION; i++) {
      // console.log(`Add players ${i * MAX_PLAYERS_PER_INSTRUCTION}-${(i+1) * MAX_PLAYERS_PER_INSTRUCTION} of ${players.length}`);
      console.log(`Add players ${i * MAX_PLAYERS_PER_INSTRUCTION} of ${Math.min(players.length-1, (i + 1) * MAX_PLAYERS_PER_INSTRUCTION)}`);
      transaction = new Transaction()
        .add(
          SfsInstruction.createAddPlayersInstruction(
            programId,
            rootAccount.publicKey,
            players.slice(
              i * MAX_PLAYERS_PER_INSTRUCTION,
              (i + 1) * MAX_PLAYERS_PER_INSTRUCTION)
          )
        );

      await sendAndConfirmTransaction(
        `Add players ${i * MAX_PLAYERS_PER_INSTRUCTION}-${(i+1) * MAX_PLAYERS_PER_INSTRUCTION} of ${players.length}` ,
        connection,
        transaction,
        payer,
        rootAccount
      );
    }

    transaction = new Transaction()
      .add(
        SfsInstruction.createInitializeRootInstruction(
          programId,
          rootAccount.publicKey,
          oracleAuthority
        )
      );

    // Send the two instructions
    await sendAndConfirmTransaction(
      'Initialize root',
      connection,
      transaction,
      payer,
      rootAccount
    );

    return sfs;
  }

  /**
   * Retrieve root information
   */
  async getRootInfo(): Promise<Root> {
    const info = await this.connection.getAccountInfo(this.publicKey);
    if (info === null) {
      throw new Error('Failed to find root account');
    }
    if (!info.owner.equals(this.programId)) {
      throw new Error(`Invalid root owner: ${JSON.stringify(info.owner)}`);
    }
    if (info.data.length != RootLayout.span) {
      throw new Error(`Invalid root size`);
    }

    const data = Buffer.from(info.data);
    const rootInfo = RootLayout.decode(data);

    rootInfo.oracleAuthority = new PublicKey(rootInfo.oracleAuthority);

    rootInfo.isInitialized = rootInfo.isInitialized != 0;

    return rootInfo;
  }
}
