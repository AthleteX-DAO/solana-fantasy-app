import { getNFLPlayerList } from './players-list';
import { calculateScore } from './calculate-score';
import { Player } from '../../sdk/state';
import { getNBAPlayerList } from './nba-players-list';

(async () => {
  const players: Player[] = players.concat(await getNBAPlayerList(), await getNFLPlayerList());
  let positions: string[] = [];
  players.forEach((p) => {
    if (!positions.includes(p.Position)) {
      positions.push(p.Position);
    }
  });

  console.log({ positions });
})();
