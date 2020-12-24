import { getPlayerList } from './players-list';
import { calculateScore } from './calculate-score';

(async () => {
  const players = await getPlayerList();
  let positions: string[] = [];
  players.forEach((p) => {
    if (!positions.includes(p.Position)) {
      positions.push(p.Position);
    }
  });

  console.log({ positions });
})();
