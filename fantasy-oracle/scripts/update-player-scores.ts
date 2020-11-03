import { calculateScore } from '../src/calculate-score';
import { connection, sfsFn, wallet } from './commons';

(async () => {
  const sfs = await sfsFn();

  console.log('Fetching players list from root');
  const root = await sfs.getRootInfo();
  const idArr = root.players.filter((p) => p.isInitialized).map((p) => p.externalId);

  console.log('currentWeek', root.currentWeek);
  console.log('Calculating scores for week', root.currentWeek - 1);
  const { scoresArr } = await calculateScore(idArr, root.currentWeek - 1);
  console.log(scoresArr);

  for (const [index, score] of scoresArr.entries()) {
    console.log(
      `Sending score update tx of player index ${index} of ${scoresArr.length}: ${score}`
    );

    await sfs.updatePlayerScore(wallet, index, score);
  }
})().catch(console.error);
