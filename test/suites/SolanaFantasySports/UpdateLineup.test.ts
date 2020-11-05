import { PublicKey } from '@solana/web3.js';
import { ok, strictEqual, throws, doesNotThrow, fail, deepStrictEqual } from 'assert';
import { u64 } from '../../../sdk/util/layout';
import { throwsAsync } from '../../helpers';
import { ACTIVE_PLAYERS_COUNT } from '../../../sdk/state';

export const UpdateLineup = () =>
  describe('Update lineup', () => {
    it('updates lineup', async () => {
      let root = await global.sfs.getRootInfo();
      let league = root.leagues[0];

      const newLineup = league.userStates[1].userPlayers
        .sort(() => 0.5 - Math.random())
        .slice(0, ACTIVE_PLAYERS_COUNT);

      await global.sfs.updateLineup(global.secondAccount, 0, 2, 3, newLineup);

      root = await global.sfs.getRootInfo();
      league = root.leagues[0];

      deepStrictEqual(league.userStates[1].lineups[2], newLineup, 'should correctly update lineup');
    });
    it('throws on update with players not owned', async () => {
      let root = await global.sfs.getRootInfo();
      let league = root.leagues[0];

      const newLineup = league.userStates[0].userPlayers
        .sort(() => 0.5 - Math.random())
        .slice(0, ACTIVE_PLAYERS_COUNT);

      await throwsAsync(
        () => global.sfs.updateLineup(global.firstAccount, 0, 2, 3, newLineup),
        'should not allow use players not owned'
      );
    });
    it('throws on past week lineup update', async () => {
      let root = await global.sfs.getRootInfo();
      let league = root.leagues[0];

      const newLineup = league.userStates[0].userPlayers
        .sort(() => 0.5 - Math.random())
        .slice(0, ACTIVE_PLAYERS_COUNT);

      await throwsAsync(
        () => global.sfs.updateLineup(global.firstAccount, 0, 1, 1, newLineup),
        'should not allow update past week lineup'
      );
    });
    it('throws on dublicate players', async () => {
      let root = await global.sfs.getRootInfo();
      let league = root.leagues[0];

      const newLineup = league.userStates[0].userPlayers
        .sort(() => 0.5 - Math.random())
        .slice(0, ACTIVE_PLAYERS_COUNT);

      newLineup[0] = newLineup[1];

      await throwsAsync(
        () => global.sfs.updateLineup(global.firstAccount, 0, 1, 1, newLineup),
        'should not allow dublicate player ids'
      );
    });
  });
