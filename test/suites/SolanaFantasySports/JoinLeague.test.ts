import { PublicKey } from '@solana/web3.js';
import { ok, strictEqual, throws, doesNotThrow, fail } from 'assert';
import { u64 } from '../../../sdk/util/layout';
import { throwsAsync } from '../../helpers';

export const JoinLeague = () =>
  describe('Join league', () => {
    it('throws on creator join attempt', async () => {
      await throwsAsync(
        () => global.sfs.joinLeague(global.firstAccount, 0, 'Test Team'),
        'should not allow double join'
      );
    });
    it('joins league', async () => {
      const bank = (global.sfs as any).bank as PublicKey;

      const balanceBefore = await global.connection.getBalance(bank);

      await global.sfs.joinLeague(global.secondAccount, 0, 'Test Team');

      const balanceAfter = await global.connection.getBalance(bank);

      const root = await global.sfs.getRootInfo();
      const league = root.leagues[0];

      strictEqual(league.userStateLength, 2, 'should be 2 player joined');
      strictEqual(balanceAfter - balanceBefore, league.bid.toNumber(), 'should transfer funds');

      const userState = league.userStates[1];
      strictEqual(userState.isInitialized, true, 'userState should be initialized');
      strictEqual(
        userState.pubKey.toBase58(),
        global.secondAccount.publicKey.toString(),
        'should correctly set first player pubkey'
      );
      strictEqual(userState.teamName, 'Test Team', 'should correctly set team name');
    });
    it('throws on joined player double join attempt', async () => {
      await throwsAsync(
        () => global.sfs.joinLeague(global.secondAccount, 0, 'Test Team'),
        'should not allow join more than limit players'
      );
    });
  });
