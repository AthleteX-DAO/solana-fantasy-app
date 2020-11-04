import { connection, wallet } from './commons';

(async () => {
  for (let i = 0; i < 5; i++) {
    await connection.requestAirdrop(wallet.publicKey, 10 * 10 ** 9);
    console.log('requested');
  }
  await new Promise((res) => setTimeout(res, 1000));
  const bal = await connection.getBalance(wallet.publicKey);
  console.log('new balance:', bal / 10 ** 9);
})().catch(console.error);
