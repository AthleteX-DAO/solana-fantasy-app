import { PublicKey } from '@solana/web3.js';
import { connection, wallet, sfsFn } from './commons';

(async () => {
  const sfs = await sfsFn();
  console.log('creating league');
  await sfs.createLeague(wallet, 'hi', 1 * 10 ** 9, 12, 'team name');
})().catch(console.error);
