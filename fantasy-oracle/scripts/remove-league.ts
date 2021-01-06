import { PublicKey } from '@solana/web3.js';
import { connection, wallet, sfsFn } from './commons';

(async () => {
  const sfs = await sfsFn();
  const index = parseInt(process.argv[2]);
  //const bank = sfs.bank as PublicKey;

  if (!index || Number.isNaN(index)) {
    //error
  }

  await sfs.removeLeague(wallet, index);
  console.log(`removed league with index:${index}`);
})().catch(console.error);
