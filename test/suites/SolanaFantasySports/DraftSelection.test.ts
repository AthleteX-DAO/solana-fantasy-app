import { Account } from '@solana/web3.js';
import { strictEqual } from 'assert';
import { Player } from '../../../sdk/instruction';
import { SFS } from '../../../sdk/sfs';
import {
  GAMES_COUNT,
  Position,
  Score,
  PLAYERS_CAPACITY,
  TEAM_PLAYERS_COUNT,
  LEAGUE_USERS_CAPACITY,
} from '../../../sdk/state';
import { throwsAsync } from '../../helpers';

export const DraftSelection = () =>
  describe('Draft selection', async () => {
    it('', async () => {
      const root = await global.sfs.getRootInfo();
      const league = root.leagues[0];

      const pickOrder = root.pickOrder;

      let usersCount = league.usersLimit;

      const reducedPickOrder = pickOrder.filter((x) => x < usersCount);

      const pickOrderForSmallerTeam = Array.from({
        length: TEAM_PLAYERS_COUNT * usersCount,
      }).map((_, leagueCurrentPick) => {
        const round = Math.floor(leagueCurrentPick / usersCount);
        let pickInRound = leagueCurrentPick % usersCount;
        if (round % 2 == 0) {
          pickInRound = usersCount - pickInRound - 1;
        }
        return reducedPickOrder[pickInRound];
      });

      console.log('expected pick order:');
      for (let i = 0; i < TEAM_PLAYERS_COUNT; i++) {
        console.log(pickOrderForSmallerTeam.slice(i * usersCount, (i + 1) * usersCount));
      }

      const getOwnerAccount = (userId: number) =>
        userId === 0 ? global.payerAccount : global.secondAccount;

      for (let i = 0; i < TEAM_PLAYERS_COUNT * usersCount; i++) {
        const expectedPick = pickOrderForSmallerTeam[i];
        const round = Math.floor(i / usersCount);

        it(`throws on wrong player pick attempt at step ${i}`, async () => {
          const userId = pickOrderForSmallerTeam.filter((x) => x !== expectedPick)[0];

          await throwsAsync(
            () => global.sfs.pickPlayer(getOwnerAccount(userId), 0, userId, i),
            'should not allow another player pick'
          );
        });

        if (i > 0 && i < TEAM_PLAYERS_COUNT * usersCount - 1) {
          it(`throws on already taken player pick, step ${i}`, async () => {
            if (i > 0 && i < TEAM_PLAYERS_COUNT * usersCount - 1) {
              await throwsAsync(
                () => global.sfs.pickPlayer(getOwnerAccount(expectedPick), 0, expectedPick, i - 1),
                'should not allow to pick already taken player'
              );
            }
          });
        }

        it(`allow right player to pick at step ${i}`, async () => {
          await global.sfs.pickPlayer(getOwnerAccount(expectedPick), 0, expectedPick, i);
          const root = await global.sfs.getRootInfo();
          const league = root.leagues[0];

          strictEqual(league.currentPick, i + 1, 'should increase current pick');
          strictEqual(
            league.userStates[expectedPick].bench[round],
            i,
            'should add correct player id to bench'
          );
          console.log(
            `User ${expectedPick} successfully picked player ${i} at step ${i}, round ${round}`
          );
        });
      }
    });
  });
