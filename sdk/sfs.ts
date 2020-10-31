import { Account, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import type { Connection } from '@solana/web3.js';

import { sendAndConfirmTransaction } from './util/send-and-confirm-transaction';
import { MAX_PLAYERS_PER_INSTRUCTION, Player, Root, RootLayout } from './state';
import { SfsInstruction, Player as PlayerInit } from './instruction';
import { u64 } from './util/layout';

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
   * @param publicKey Public key of the root account
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
    private programId: PublicKey,
    /**
     * Bank account for the SFS program
     */
    private bank: PublicKey
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
    const [bank, _] = await PublicKey.findProgramAddress([Buffer.from([0])], programId);
    const sfs = new SFS(connection, rootAccount.publicKey, programId, bank);

    // Allocate memory for the account
    const balanceNeeded = await SFS.getMinBalanceRentForExemptRoot(connection);

    let transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: rootAccount.publicKey,
        lamports: balanceNeeded,
        space: RootLayout.span,
        programId,
      })
    );

    await sendAndConfirmTransaction('Create account', connection, transaction, payer, rootAccount);

    for (let i = 0; i < players.length / MAX_PLAYERS_PER_INSTRUCTION; i++) {
      // console.log(`Add players ${i * MAX_PLAYERS_PER_INSTRUCTION}-${(i+1) * MAX_PLAYERS_PER_INSTRUCTION} of ${players.length}`);
      console.log(
        `Add players ${i * MAX_PLAYERS_PER_INSTRUCTION} of ${Math.min(
          players.length - 1,
          (i + 1) * MAX_PLAYERS_PER_INSTRUCTION
        )}`
      );
      transaction = new Transaction().add(
        SfsInstruction.createAddPlayersInstruction(
          programId,
          rootAccount.publicKey,
          players.slice(i * MAX_PLAYERS_PER_INSTRUCTION, (i + 1) * MAX_PLAYERS_PER_INSTRUCTION)
        )
      );

      await sendAndConfirmTransaction(
        `Add players ${i * MAX_PLAYERS_PER_INSTRUCTION}-${
          (i + 1) * MAX_PLAYERS_PER_INSTRUCTION
        } of ${players.length}`,
        connection,
        transaction,
        payer
      );
    }

    transaction = new Transaction().add(
      SfsInstruction.createInitializeRootInstruction(
        programId,
        rootAccount.publicKey,
        oracleAuthority
      )
    );

    // Send the two instructions
    await sendAndConfirmTransaction('Initialize root', connection, transaction, payer);

    return sfs;
  }

  /**
   * Create a league.
   *
   * This account may then be used as a `transfer()` or `approve()` destination
   *
   * @param owner User account that will own the new account
   * @return Public key of the new empty account
   */
  async createLeague(
    owner: Account,
    bank: Account,
    name: string,
    bid: number | u64,
    usersLimit: number
  ): Promise<number> {
    const transaction = new Transaction();
    transaction.add(
      SfsInstruction.createCreateLeagueInstruction(
        this.programId,
        this.publicKey,
        this.bank,
        name,
        bid,
        usersLimit,
        owner.publicKey
      )
    );
    const rootInfo = await this.connection.getAccountInfo(this.publicKey);
    if (rootInfo === null) {
      throw new Error('Failed to find root account');
    }
    await sendAndConfirmTransaction('Create league', this.connection, transaction, owner);

    const root = await this.getRootInfo();
    for (let i = root.leaguesCount; i >= 0; i--) {
      if (root.leagues[i].userStates.some((x) => x.pubKey.equals(owner.publicKey))) {
        return i;
      }
    }
    throw new Error('Created league is not found');
  }

  /**
   * Join a league.
   *
   * This account may then be used as a `transfer()` or `approve()` destination
   *
   * @param owner User account that will own the new account
   * @return Public key of the new empty account
   */
  async joinLeague(owner: Account, leagueId: number): Promise<void> {
    const transaction = new Transaction();
    transaction.add(
      SfsInstruction.createJoinLeagueInstruction(
        this.programId,
        this.publicKey,
        leagueId,
        owner.publicKey
      )
    );

    await sendAndConfirmTransaction('Join league', this.connection, transaction, owner);
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

    rootInfo.isInitialized = rootInfo.isInitialized != 0;

    return rootInfo;
  }
}
