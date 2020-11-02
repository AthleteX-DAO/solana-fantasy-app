import { connection, wallet } from './commons';

(async () => {
  await connection.requestAirdrop(wallet.publicKey, 10 * 10 ** 9);
  console.log('requested');
})().catch(console.error);
