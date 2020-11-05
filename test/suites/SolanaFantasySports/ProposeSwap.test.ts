import { PublicKey } from '@solana/web3.js';
import { ok, strictEqual, throws, doesNotThrow, fail, deepStrictEqual } from 'assert';
import { u64 } from '../../../sdk/util/layout';
import { throwsAsync } from '../../helpers';
import { ACTIVE_PLAYERS_COUNT } from '../../../sdk/state';

export const ProposeSwap = () =>
  describe('ProposeSwap', () => {
    it('throws on invalid owner', async () => {
      let root = await global.sfs.getRootInfo();
      let league = root.leagues[0];

      const givePlayerId =
        league.userStates[0].userPlayers.find(
          (x) => !league.userStates[0].lineups[root.currentWeek - 1].includes(x)
        ) || 0;
      const wantPlayerId =
        league.userStates[1].userPlayers.find(
          (x) => !league.userStates[1].lineups[root.currentWeek - 1].includes(x)
        ) || 0;

      await throwsAsync(
        () => global.sfs.proposeSwap(global.secondAccount, 0, 1, 2, givePlayerId, wantPlayerId),
        'should not allow make proposal from another user'
      );
    });
    it('throws on proposal with active players', async () => {
      let root = await global.sfs.getRootInfo();
      let league = root.leagues[0];

      const givePlayerId = league.userStates[0].lineups[root.currentWeek - 1][0];
      const wantPlayerId = league.userStates[1].userPlayers[0];

      await throwsAsync(
        () => global.sfs.proposeSwap(global.firstAccount, 0, 1, 2, givePlayerId, wantPlayerId),
        'should not allow make proposal with active player'
      );
    });
    it('throws on proposal with players not owned', async () => {
      let root = await global.sfs.getRootInfo();
      let league = root.leagues[0];

      const givePlayerId = league.userStates[1].userPlayers[1];
      const wantPlayerId = league.userStates[1].userPlayers[0];

      await throwsAsync(
        () => global.sfs.proposeSwap(global.firstAccount, 0, 1, 2, givePlayerId, wantPlayerId),
        'should not allow make proposal with players not owned'
      );
    });
    it('Propose swap', async () => {
      let root = await global.sfs.getRootInfo();
      let league = root.leagues[0];

      const givePlayerId =
        league.userStates[0].userPlayers.find(
          (x) => !league.userStates[0].lineups[root.currentWeek - 1].includes(x)
        ) || 0;
      const wantPlayerId =
        league.userStates[1].userPlayers.find(
          (x) => !league.userStates[1].lineups[root.currentWeek - 1].includes(x)
        ) || 0;

      await global.sfs.proposeSwap(global.firstAccount, 0, 1, 2, givePlayerId, wantPlayerId);

      root = await global.sfs.getRootInfo();
      league = root.leagues[0];

      strictEqual(league.userStates[0].swapProposalsCount, 1, 'should add swap proposal count');
      deepStrictEqual(
        league.userStates[0].swapProposals[0],
        { givePlayerId, wantPlayerId, isInitialized: true },
        'should correctly propose swap'
      );

      await throwsAsync(
        () => global.sfs.proposeSwap(global.firstAccount, 0, 1, 2, givePlayerId, wantPlayerId),
        'should not allow make same proposal twice'
      );
    });
  });
