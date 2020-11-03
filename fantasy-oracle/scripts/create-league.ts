import { PublicKey } from '@solana/web3.js';
import { connection, wallet, sfs } from './commons';

(async () => {
  const rootBefore = await sfs.getRootInfo();
  console.log('currentWeek before', rootBefore.currentWeek);

  console.log('waiting for 3 sec');
  await new Promise((res) => setTimeout(res, 3000));

  console.log('incrementing week');
  await sfs.createLeague(wallet, 'hi', 1 * 10 ** 9, 12);

  const rootAfter = await sfs.getRootInfo();
  console.log('currentWeek after', rootAfter.currentWeek);
})().catch(console.error);
