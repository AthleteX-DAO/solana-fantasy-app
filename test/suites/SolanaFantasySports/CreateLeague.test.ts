import { PublicKey } from '@solana/web3.js';
import { ok, strictEqual } from 'assert';
import { u64 } from '../../../sdk/util/layout';

export const CreateLeague = () =>
  describe('Create league', () => {
    it('creates league', async () => {
      const bank = (global.sfs as any).bank as PublicKey;

      const balanceBefore = await global.connection.getBalance(bank);

      const leagueIndex = await global.sfs.createLeague(
        global.firstAccount,
        'Test League',
        1 * 10 ** 9,
        2,
        'Test Team',
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      );

      const balanceAfter = await global.connection.getBalance(bank);

      console.log(`League index ${leagueIndex}`);

      const root = await global.sfs.getRootInfo();
      const league = root.leagues[leagueIndex];

      strictEqual(league.userStateCount, 1, 'should be 1 player joined');
      strictEqual(league.isInitialized, true, 'league should be initialized');
      strictEqual(league.name, 'Test League', 'should correctly set name');
      strictEqual(league.usersLimit, 2, 'should correctly set users limit');
      strictEqual(league.currentPick, 0, 'should correctly set currentPick');
      strictEqual(
        league.bid.toString(),
        new u64(1 * 10 ** 9).toString(),
        'should correctly set bid'
      );
      strictEqual(balanceAfter - balanceBefore, 1 * 10 ** 9, 'should transfer funds');

      const userState = league.userStates[0];
      strictEqual(userState.isInitialized, true, 'userState should be initialized');
      strictEqual(
        userState.pubKey.toBase58(),
        global.firstAccount.publicKey.toString(),
        'should correctly set first player pubkey'
      );
      strictEqual(userState.teamName, 'Test Team', 'should correctly set team name');
    });
  });
