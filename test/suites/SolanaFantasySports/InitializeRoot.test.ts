import { Account } from '@solana/web3.js';
import { Player } from '../../../sdk/instruction';
import { SFS } from '../../../sdk/sfs';
import { Position, PLAYERS_CAPACITY, Stage, LEAGUE_USERS_CAPACITY } from '../../../sdk/state';
import { strictEqual, ok } from 'assert';
import { hasDuplicates } from '../../helpers';

const rootAccount = new Account();

export const InitializeRoot = () =>
  describe('Initialize root', () => {
    it('initializes root account', async () => {
      console.log('Initializing root account', rootAccount.publicKey.toBase58());

      const players = Array.from({ length: PLAYERS_CAPACITY }).map(
        (_, i): Player => ({
          externalId: i,
          position: Position.RB,
        })
      );

      const balanceBefore = await global.connection.getBalance(global.payerAccount.publicKey);

      global.sfs = await SFS.initializeRoot(
        global.connection,
        global.payerAccount,
        global.payerAccount.publicKey,
        players,
        0,
        global.solanaFantasySportsPPK
      );

      const balanceAfter = await global.connection.getBalance(global.payerAccount.publicKey);

      console.log(`Initialization cost ${(balanceBefore - balanceAfter) / 10 ** 9} sol`);

      const root = await global.sfs.getRootInfo();

      ok(
        root.oracleAuthority.equals(global.payerAccount.publicKey),
        'oracle authority should be set correctly'
      );

      strictEqual(root.playersCount, players.length, 'players count should match');
      strictEqual(root.stage, Stage.SeasonOpen, 'stage should be correct');
      strictEqual(root.leaguesCount, 0, 'should be no leagues yet');

      ok(
        root.pickOrder.every((x) => x > 0 && x < LEAGUE_USERS_CAPACITY + 1),
        'all pick order values should be in range of users'
      );

      ok(!hasDuplicates(root.pickOrder), 'pick order should not contain duplicates');
    });
  });
