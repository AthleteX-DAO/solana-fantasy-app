import { connection, wallet } from './commons';

(async () => {
  const balance = await connection.getBalance(wallet.publicKey, 'recent');
  console.log('balance', balance);
})().catch(console.error);
