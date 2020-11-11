import { PublicKey } from '@solana/web3.js';
import { ok, strictEqual, throws, doesNotThrow, fail, deepStrictEqual } from 'assert';
import { u64 } from '../../../sdk/util/layout';
import { throwsAsync } from '../../helpers';
import { ACTIVE_PLAYERS_COUNT } from '../../../sdk/state';

export const AcceptSwap = () =>
  describe('Accept swap', () => {
    it('throws on invalid owner', async () => {
      let root = await global.sfs.getRootInfo();
      let league = root.leagues[0];

      const givePlayerId = league.userStates[0].swapProposals[0].givePlayerId;
      const wantPlayerId = league.userStates[0].swapProposals[0].wantPlayerId;

      await throwsAsync(
        () => global.sfs.acceptSwap(global.firstAccount, 0, 2, 1, wantPlayerId, givePlayerId),
        'should not allow accept proposal from another user'
      );
    });
    it('Accept swap', async () => {
      let root = await global.sfs.getRootInfo();
      let league = root.leagues[0];

      const givePlayerId = league.userStates[0].swapProposals[0].givePlayerId;
      const wantPlayerId = league.userStates[0].swapProposals[0].wantPlayerId;

      await global.sfs.acceptSwap(global.secondAccount, 0, 2, 1, wantPlayerId, givePlayerId);

      root = await global.sfs.getRootInfo();
      league = root.leagues[0];

      strictEqual(
        league.userStates[0].swapProposalsCount,
        1,
        'should decrease swap proposal count'
      );

      ok(
        !league.userStates[0].userPlayers.includes(givePlayerId),
        'proposing user players list should no longer contained given player'
      );
      ok(
        !league.userStates[0].lineups
          .slice(root.currentWeek)
          .every((l) => l.includes(givePlayerId)),
        'proposing user future lineups should no longer contained given player'
      );
      ok(
        league.userStates[0].userPlayers.includes(wantPlayerId),
        'proposing user players list should contain received player'
      );

      ok(
        !league.userStates[1].userPlayers.includes(wantPlayerId),
        'accepting user players list should no longer contained given player'
      );
      ok(
        !league.userStates[1].lineups
          .slice(root.currentWeek)
          .every((l) => l.includes(wantPlayerId)),
        'accepting user future lineups should no longer contained given player'
      );
      ok(
        league.userStates[1].userPlayers.includes(givePlayerId),
        'accepting user players list should contain received player'
      );

      await throwsAsync(
        () => global.sfs.acceptSwap(global.firstAccount, 0, 2, 1, wantPlayerId, givePlayerId),
        'should not allow accept same proposal twice'
      );
    });
  });
