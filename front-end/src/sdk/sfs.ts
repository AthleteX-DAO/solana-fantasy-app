import { Account, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import type { Connection } from '@solana/web3.js';

import { sendAndConfirmTransaction } from './util/send-and-confirm-transaction';
import {
  MAX_PLAYERS_PER_INSTRUCTION,
  Player,
  Root,
  RootLayout,
  LEAGUE_USERS_CAPACITY,
  GAMES_COUNT,
  League,
  ACTIVE_PLAYERS_COUNT,
  MAX_PLAYERS_SCORES_PER_TRANSACTION,
} from './state';
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
    currentWeek: number,
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

    const pickOrder = Array.from({ length: LEAGUE_USERS_CAPACITY })
      .map((_, i) => i + 1)
      .sort(() => 0.5 - Math.random());

    transaction = new Transaction().add(
      SfsInstruction.createSeedDraftSelectionInstruction(
        programId,
        rootAccount.publicKey,
        pickOrder
      )
    );
    console.log('Seed draft selection');
    await sendAndConfirmTransaction('Seed draft selection', connection, transaction, payer);

    transaction = new Transaction().add(
      SfsInstruction.createInitializeRootInstruction(
        programId,
        rootAccount.publicKey,
        oracleAuthority,
        currentWeek
      )
    );

    console.log('Initialize root');
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
    name: string,
    bid: number | u64,
    usersLimit: number,
    teamName: string
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
        teamName,
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
  async joinLeague(owner: Account, leagueIndex: number, teamName: string): Promise<void> {
    const transaction = new Transaction();
    transaction.add(
      SfsInstruction.createJoinLeagueInstruction(
        this.programId,
        this.publicKey,
        this.bank,
        leagueIndex,
        teamName,
        owner.publicKey
      )
    );

    await sendAndConfirmTransaction('Join league', this.connection, transaction, owner);
  }

  /**
   * Pick player.
   */
  async pickPlayer(
    owner: Account,
    leagueIndex: number,
    userId: number,
    playerId: number
  ): Promise<void> {
    const transaction = new Transaction();
    transaction.add(
      SfsInstruction.createPickPlayerInstruction(
        this.programId,
        this.publicKey,
        leagueIndex,
        userId,
        playerId,
        owner.publicKey
      )
    );

    await sendAndConfirmTransaction('Pick player', this.connection, transaction, owner);
  }
  /**
   * Update lineup.
   */
  async updateLineup(
    owner: Account,
    leagueIndex: number,
    userId: number,
    week: number,
    activePlayers: number[]
  ): Promise<void> {
    const transaction = new Transaction();
    transaction.add(
      SfsInstruction.createUpdateLineupInstruction(
        this.programId,
        this.publicKey,
        leagueIndex,
        userId,
        week,
        activePlayers,
        owner.publicKey
      )
    );

    await sendAndConfirmTransaction('Update lineup', this.connection, transaction, owner);
  }
  /**
   * Propose swap.
   */
  async proposeSwap(
    owner: Account,
    leagueIndex: number,
    proposingUserId: number,
    acceptingUserId: number,
    givePlayerId: number,
    wantPlayerId: number
  ): Promise<void> {
    const transaction = new Transaction();
    transaction.add(
      SfsInstruction.createProposeSwapInstruction(
        this.programId,
        this.publicKey,
        leagueIndex,
        proposingUserId,
        acceptingUserId,
        givePlayerId,
        wantPlayerId,
        owner.publicKey
      )
    );

    await sendAndConfirmTransaction('Propose swap', this.connection, transaction, owner);
  }
  /**
   * Accept swap.
   */
  async acceptSwap(
    owner: Account,
    leagueIndex: number,
    acceptingUserId: number,
    proposingUserId: number,
    wantPlayerId: number,
    givePlayerId: number
  ): Promise<void> {
    const transaction = new Transaction();
    transaction.add(
      SfsInstruction.createAcceptSwapInstruction(
        this.programId,
        this.publicKey,
        leagueIndex,
        acceptingUserId,
        proposingUserId,
        wantPlayerId,
        givePlayerId,
        owner.publicKey
      )
    );

    await sendAndConfirmTransaction('Accept swap', this.connection, transaction, owner);
  }
  /**
   * Reject swap.
   */
  async rejectSwap(
    owner: Account,
    leagueIndex: number,
    acceptingUserId: number,
    proposingUserId: number,
    wantPlayerId: number,
    givePlayerId: number
  ): Promise<void> {
    const transaction = new Transaction();
    transaction.add(
      SfsInstruction.createRejectSwapInstruction(
        this.programId,
        this.publicKey,
        leagueIndex,
        acceptingUserId,
        proposingUserId,
        wantPlayerId,
        givePlayerId,
        owner.publicKey
      )
    );

    await sendAndConfirmTransaction('Reject swap', this.connection, transaction, owner);
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

    return rootInfo;
  }

  static getWeekScores(root: Root, leagueIndex: number, userId: number, week: number) {
    let league = root.leagues[leagueIndex];
    let score = league.userStates[userId - 1].lineups[week - 1].reduce((sum, playerId) => {
      return sum + root.players[playerId - 1].scores[week - 1].score1;
    }, 0);
    return score;
  }

  static getUserScores(root: Root, leagueIndex: number) {
    let league = root.leagues[leagueIndex];
    return league.userStates.slice(0, league.userStateCount).map((userState, i) => {
      const score = userState.lineups.slice(league.startWeek - 1).reduce(
        (sum, lineup, lineupIndex) =>
          sum +
          lineup.reduce((sum2, playerId) => {
            return (
              sum2 + root.players[playerId - 1].scores[lineupIndex + league.startWeek - 1].score1
            );
          }, 0),
        0
      );

      return {
        userId: i + 1,
        userState,
        score,
      };
    });
  }

  static getWinners(root: Root, leagueIndex: number) {
    const scores = SFS.getUserScores(root, leagueIndex);
    const maxScore = scores.reduce((max, x) => (x.score > max ? x.score : max), 0);
    return scores.filter((x) => x.score === maxScore);
  }

  /**
   * Update player scores
   */
  async updatePlayerScores(
    owner: Account,
    scores: { playerId: number; playerScore: number }[]
  ): Promise<void> {
    for (let i = 0; i < scores.length / MAX_PLAYERS_SCORES_PER_TRANSACTION; i++) {
      console.log(
        `Uploading scores ${i * MAX_PLAYERS_SCORES_PER_TRANSACTION} of ${Math.min(
          scores.length - 1,
          (i + 1) * MAX_PLAYERS_SCORES_PER_TRANSACTION
        )}`
      );
      const transaction = new Transaction();
      scores
        .slice(i * MAX_PLAYERS_SCORES_PER_TRANSACTION, (i + 1) * MAX_PLAYERS_SCORES_PER_TRANSACTION)
        .forEach((x) => {
          transaction.add(
            SfsInstruction.createUpdatePlayerScoreInstruction(
              this.programId,
              this.publicKey,
              this.bank,
              x.playerId,
              x.playerScore,
              owner.publicKey
            )
          );
        });
      await sendAndConfirmTransaction(
        `Uploading scores ${i * MAX_PLAYERS_SCORES_PER_TRANSACTION} of ${Math.min(
          scores.length - 1,
          (i + 1) * MAX_PLAYERS_SCORES_PER_TRANSACTION
        )}`,
        this.connection,
        transaction,
        owner
      );
    }
  }

  /**
   * Increment week
   */
  async incrementWeek(owner: Account): Promise<void> {
    const transaction = new Transaction();
    transaction.add(
      SfsInstruction.createIncrementWeekInstruction(
        this.programId,
        this.publicKey,
        this.bank,
        owner.publicKey
      )
    );

    await sendAndConfirmTransaction('Increment week', this.connection, transaction, owner);
  }

  /**
   * Claim reward.
   */
  async claimReward(leagueIndex: number, winners: PublicKey[], sender: Account): Promise<void> {
    const transaction = new Transaction();
    transaction.add(
      SfsInstruction.createClaimRewardInstruction(
        this.programId,
        this.publicKey,
        this.bank,
        leagueIndex,
        winners
      )
    );

    await sendAndConfirmTransaction('Claim reward', this.connection, transaction, sender);
  }
}
