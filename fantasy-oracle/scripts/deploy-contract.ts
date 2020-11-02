import { Account, BpfLoader, BPF_LOADER_PROGRAM_ID } from '@solana/web3.js';
import { strictEqual } from 'assert';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { connection, wallet } from './commons';

connection;

(async () => {
  await connection.requestAirdrop(wallet.publicKey, 10 * 10 ** 9);
  console.log('requested for airdrop');

  await new Promise((res) => setTimeout(res, 1000));

  const data = readFileSync(
    resolve(__dirname, '../../contracts/solana-fantasy-sports/solana_fantasy_sports.so'),
    {
      encoding: 'hex',
    }
  );
  console.log(data.slice(0, 10));

  const programAccount = new Account();

  const balanceBefore = await connection.getBalance(wallet.publicKey);

  console.log('deploying contract....');

  try {
    await BpfLoader.load(
      connection,
      wallet,
      programAccount,
      Buffer.from(data, 'hex'),
      BPF_LOADER_PROGRAM_ID
    );

    // strictEqual(isLoaded, true, 'load method should return true');

    console.log('the program contract is deployed at', programAccount.publicKey.toBase58());

    const balanceAfter = await connection.getBalance(wallet.publicKey);
    // console.log(balanceAfter);

    console.log('fees for deploy tx', (balanceBefore - balanceAfter) / 10 ** 9, 'sol');
  } catch (error) {
    console.log(error);
  }
})().catch(console.error);
