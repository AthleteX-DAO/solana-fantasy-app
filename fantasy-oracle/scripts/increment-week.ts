import { PublicKey } from '@solana/web3.js';
import { connection, wallet, sfsFn } from './commons';

(async () => {
  const sfs = await sfsFn();
  // @ts-ignore
  const bank = sfs.bank as PublicKey;

  const rootBefore = await sfs.getRootInfo();
  console.log('currentWeek before', rootBefore.currentWeek);

  console.log('waiting for 3 sec');
  await new Promise((res) => setTimeout(res, 3000));

  console.log('incrementing week');
  await sfs.incrementWeek(wallet);

  const rootAfter = await sfs.getRootInfo();
  console.log('currentWeek after', rootAfter.currentWeek);
})().catch(console.error);
