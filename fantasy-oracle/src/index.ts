import { getPlayerList } from './players-list';
import { calculateScore } from './calculate-score';

(async () => {
  const players = await getPlayerList();
  const score = await calculateScore(players.slice(0, 2).map(p => p.PlayerID));
  console.log(score);
})(); 