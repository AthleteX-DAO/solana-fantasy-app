import { connection, wallet } from './commons';

(async () => {
  const balance = await connection.getBalance(wallet.publicKey, 'recent');
  console.log('balance', balance / 10 ** 9);
})().catch(console.error);
