import { PublicKey } from '@solana/web3.js';
import { deepStrictEqual, ok, strictEqual } from 'assert';
import { u64 } from '../../../sdk/util/layout';

export const UpdatePlayerScore = () =>
  describe('Update Player Score', () => {
    it('increment week', async () => {
      const bank = (global.sfs as any).bank as PublicKey;

      const balanceBefore = await global.connection.getBalance(bank);
      const rootBefore = await global.sfs.getRootInfo();
      strictEqual(rootBefore.currentWeek, 0, 'week should be zero initially');

      await global.sfs.incrementWeek(global.payerAccount);

      const balanceAfter = await global.connection.getBalance(bank);
      const rootAfter = await global.sfs.getRootInfo();
      strictEqual(rootAfter.currentWeek, 1, 'week should be 1 after increment');
    });

    it('updates score of a player', async () => {
      const bank = (global.sfs as any).bank as PublicKey;
      const rootBefore = await global.sfs.getRootInfo();

      const balanceBefore = await global.connection.getBalance(bank);

      const scores = rootBefore.players.map((player, index) => ({
        playerId: index + 1,
        playerScore: Math.round(Math.random() * 100),
      }));

      await global.sfs.updatePlayerScores(global.payerAccount, scores);

      const balanceAfter = await global.connection.getBalance(bank);

      const root = await global.sfs.getRootInfo();
      const scoresAfter = root.players.map((p, index) => ({
        playerId: index + 1,
        playerScore: p.scores[root.currentWeek - 1].score1,
      }));
      deepStrictEqual(scores, scoresAfter, 'score should be set');
    });
  });
