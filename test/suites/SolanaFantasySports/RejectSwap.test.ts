import { PublicKey } from '@solana/web3.js';
import { ok, strictEqual, throws, doesNotThrow, fail, deepStrictEqual } from 'assert';
import { u64 } from '../../../sdk/util/layout';
import { throwsAsync } from '../../helpers';
import { ACTIVE_PLAYERS_COUNT } from '../../../sdk/state';

export const RejectSwap = () =>
  describe('Reject swap', () => {
    it('throws on invalid owner', async () => {
      let root = await global.sfs.getRootInfo();
      let league = root.leagues[0];

      const givePlayerId = league.userStates[0].swapProposals[0].givePlayerId;
      const wantPlayerId = league.userStates[0].swapProposals[0].wantPlayerId;

      await throwsAsync(
        () => global.sfs.rejectSwap(global.payerAccount, 0, 2, 1, wantPlayerId, givePlayerId),
        'should not allow reject proposal from another user'
      );
    });
    it('Accept swap', async () => {
      let root = await global.sfs.getRootInfo();
      let league = root.leagues[0];

      const givePlayerId = league.userStates[0].swapProposals[0].givePlayerId;
      const wantPlayerId = league.userStates[0].swapProposals[0].wantPlayerId;

      await global.sfs.rejectSwap(global.secondAccount, 0, 2, 1, wantPlayerId, givePlayerId);

      root = await global.sfs.getRootInfo();
      league = root.leagues[0];

      strictEqual(
        league.userStates[0].swapProposalsCount,
        0,
        'should decrease swap proposal count'
      );

      ok(
        league.userStates[0].userPlayers.includes(givePlayerId),
        'proposing user players list should still contain given player'
      );
      ok(
        !league.userStates[0].userPlayers.includes(wantPlayerId),
        'proposing user players list should not contain received player'
      );

      ok(
        league.userStates[1].userPlayers.includes(wantPlayerId),
        'accepting user players list should still contain given player'
      );
      ok(
        !league.userStates[1].userPlayers.includes(givePlayerId),
        'accepting user players list should not contain received player'
      );

      await throwsAsync(
        () => global.sfs.rejectSwap(global.firstAccount, 0, 2, 1, wantPlayerId, givePlayerId),
        'should not allow reject same proposal twice'
      );
    });
  });
