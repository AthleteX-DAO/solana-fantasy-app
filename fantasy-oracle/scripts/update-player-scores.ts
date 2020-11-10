import { calculateScore } from '../src/calculate-score';
import { connection, sfsFn, wallet } from './commons';

interface SdkScore {
  playerId: number;
  playerScore: number;
}

(async () => {
  const sfs = await sfsFn();

  console.log('Fetching players list from root');
  const root = await sfs.getRootInfo();
  const idArr = root.players.filter((p) => p.isInitialized).map((p) => p.externalId);

  console.log('ongoing week', root.currentWeek + 1);
  console.log('Calculating scores for week', root.currentWeek);
  const { scoresArr } = await calculateScore(idArr, root.currentWeek);
  console.log('calculated scores', scoresArr);

  const scores: SdkScore[] = [];

  for (const [index, score] of scoresArr.entries()) {
    scores.push({
      playerId: index + 1,
      playerScore: score,
    });
    // console.log(`Score of player id ${index + 1}: ${score}`);
  }

  console.log(`Sending score update tx`);
  await sfs.updatePlayerScores(wallet, scores);
})().catch(console.error);
