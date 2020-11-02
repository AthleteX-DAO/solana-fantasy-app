import { PublicKey } from '@solana/web3.js';
import { ok, strictEqual } from 'assert';
import { u64 } from '../../../sdk/util/layout';

export const UpdatePlayerScore = () =>
  describe('Update Player Score', () => {
    it('increment week', async () => {
      const bank = (global.sfs as any).bank as PublicKey;

      const balanceBefore = await global.connection.getBalance(bank);
      const rootBefore = await global.sfs.getRootInfo();
      strictEqual(rootBefore.currentWeek, 0, 'week should be zero initially');

      await global.sfs.incrementWeek(global.payerAccount);

      await new Promise((res) => setTimeout(res, 1000));

      const balanceAfter = await global.connection.getBalance(bank);
      const rootAfter = await global.sfs.getRootInfo();
      strictEqual(rootAfter.currentWeek, 1, 'week should be 1 after increment');
    });

    it('updates score of a player', async () => {
      const bank = (global.sfs as any).bank as PublicKey;

      const balanceBefore = await global.connection.getBalance(bank);

      const PLAYER_ID = 2;
      const SCORE = 3;

      await global.sfs.updatePlayerScore(global.payerAccount, PLAYER_ID, SCORE);

      await new Promise((res) => setTimeout(res, 1000));

      const balanceAfter = await global.connection.getBalance(bank);

      const root = await global.sfs.getRootInfo();
      const scores = root.players.map((p) => p.scores);

      const _stroredScore = scores[PLAYER_ID][root.currentWeek - 1].score1;
      strictEqual(SCORE, _stroredScore, 'score should be set');
    });

    it('cannot update score again in same week', async () => {
      try {
        const bank = (global.sfs as any).bank as PublicKey;

        const balanceBefore = await global.connection.getBalance(bank);

        const PLAYER_ID = 2;
        const SCORE = 4;

        await global.sfs.updatePlayerScore(global.payerAccount, PLAYER_ID, SCORE);

        ok(false, 'should throw error');
      } catch (error) {
        // console.log(error);
        ok(error.message.includes('custom program error: 0xd'));
      }
    });
  });
