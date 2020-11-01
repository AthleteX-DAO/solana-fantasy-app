import { strictEqual } from 'assert';
import { TEAM_PLAYERS_COUNT } from '../../../sdk/state';
import { throwsAsync } from '../../helpers';

export const DraftSelection = () =>
  describe('Draft selection', () => {
    let usersCount = 2;

    const getContext = async (i: number) => {
      const root = await global.sfs.getRootInfo();
      const league = root.leagues[0];

      const pickOrder = root.pickOrder;

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

      const expectedPick = pickOrderForSmallerTeam[i];
      const round = Math.floor(i / usersCount);

      const playersToPick = pickOrderForSmallerTeam.map((_, i) => i + 100);
      return { league, pickOrderForSmallerTeam, round, expectedPick, playersToPick };
    };

    it(``, async () => {
      const { pickOrderForSmallerTeam } = await getContext(0);
      console.log('expected pick order:');
      for (let i = 0; i < TEAM_PLAYERS_COUNT; i++) {
        console.log(pickOrderForSmallerTeam.slice(i * usersCount, (i + 1) * usersCount));
      }
    });

    const getOwnerAccount = (userId: number) =>
      userId === 0 ? global.payerAccount : global.secondAccount;

    for (let i = 0; i < TEAM_PLAYERS_COUNT * usersCount; i++) {
      if (i === 0) {
        it(`throws on wrong player pick attempt at step ${i}`, async () => {
          const { pickOrderForSmallerTeam, expectedPick, playersToPick } = await getContext(i);

          const userId = pickOrderForSmallerTeam.filter((x) => x !== expectedPick)[0];

          await throwsAsync(
            () => global.sfs.pickPlayer(getOwnerAccount(userId), 0, userId, playersToPick[i]),
            'should not allow another player pick'
          );
        });

        if (i > 0 && i < TEAM_PLAYERS_COUNT * usersCount - 1) {
          it(`throws on already taken player pick, step ${i}`, async () => {
            const { expectedPick, playersToPick } = await getContext(i);

            if (i > 0 && i < TEAM_PLAYERS_COUNT * usersCount - 1) {
              await throwsAsync(
                () =>
                  global.sfs.pickPlayer(
                    getOwnerAccount(expectedPick),
                    0,
                    expectedPick,
                    playersToPick[i - 1]
                  ),
                'should not allow to pick already taken player'
              );
            }
          });
        }
      }

      it(`allow right player to pick at step ${i}`, async () => {
        const { expectedPick, round, playersToPick } = await getContext(i);

        await global.sfs.pickPlayer(
          getOwnerAccount(expectedPick),
          0,
          expectedPick,
          playersToPick[i]
        );
        const root = await global.sfs.getRootInfo();
        const league = root.leagues[0];

        strictEqual(league.currentPick, i + 1, 'should increase current pick');
        strictEqual(
          league.userStates[expectedPick].userPlayers[round],
          playersToPick[i],
          'should add correct player id to bench'
        );
        console.log(
          `User ${expectedPick} successfully picked player ${playersToPick[i]} at step ${i}, round ${round}`
        );
      });
    }
  });
