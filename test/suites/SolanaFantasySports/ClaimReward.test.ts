import { AccountInfo, PublicKey } from '@solana/web3.js';
import { ok, strictEqual, throws, doesNotThrow, fail, deepStrictEqual } from 'assert';
import { u64 } from '../../../sdk/util/layout';
import { throwsAsync } from '../../helpers';
import { ACTIVE_PLAYERS_COUNT, GAMES_COUNT } from '../../../sdk/state';
import { SFS } from '../../../sdk/sfs';
import BN from 'bn.js';
import { connection } from '../../../fantasy-oracle/scripts/commons';

export const ClaimReward = () =>
  describe('ClaimReward', () => {
    it('throws on reward claim before season end', async () => {
      let root = await global.sfs.getRootInfo();
      let winners = SFS.getWinners(root, 0);

      await throwsAsync(
        () =>
          global.sfs.claimReward(
            0,
            winners.map((x) => x.userState.pubKey),
            global.payerAccount
          ),
        'should not allow claim reward before season end'
      );
    });
    it('Claims rewards', async () => {
      let root = await global.sfs.getRootInfo();
      let league = root.leagues[0];

      for (let i = root.currentWeek; i <= GAMES_COUNT; i++) {
        await global.sfs.incrementWeek(global.payerAccount);
      }

      let winners = SFS.getWinners(root, 0);

      const balancesBefore = await Promise.all(
        winners.map((x) => global.connection.getBalance(x.userState.pubKey))
      );

      await global.sfs.claimReward(
        0,
        winners.map((x) => x.userState.pubKey),
        global.payerAccount
      );

      const balancesAfter = await Promise.all(
        winners.map((x) => global.connection.getBalance(x.userState.pubKey))
      );

      root = await global.sfs.getRootInfo();
      league = root.leagues[0];

      ok(
        balancesAfter
          .map((x, index) => x - balancesBefore[index])
          .every((x) => x === league.bid.div(new BN(winners.length)).toNumber()),
        'should correctly increase winners balances'
      );

      strictEqual(league.isRewardClaimed, true, 'should set isRewardClaimed to true');

      await throwsAsync(
        () =>
          global.sfs.claimReward(
            0,
            winners.map((x) => x.userState.pubKey),
            global.payerAccount
          ),
        'should not allow claim rewards twice'
      );
    });
  });
