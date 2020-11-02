import { Account, BpfLoader, BPF_LOADER_PROGRAM_ID } from '@solana/web3.js';
import { ok, strictEqual } from 'assert';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { connection, wallet } from './commons';
import { SFS } from '../../sdk/sfs';
import { PLAYERS_CAPACITY, Position, Stage, LEAGUE_USERS_CAPACITY } from '../../sdk/state';
import { Player } from '../../sdk/instruction';
import { hasDuplicates } from '../../test/helpers';

connection;

(async () => {
  const programAccount = new Account();

  {
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

    const balanceBefore = await connection.getBalance(wallet.publicKey);

    console.log('deploying contract....');

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
  }

  /**
   * Initialize root
   */
  const rootAccount = new Account();
  let sfs: SFS;
  {
    console.log('Initializing root account', rootAccount.publicKey.toBase58());

    const players = Array.from({ length: PLAYERS_CAPACITY }).map(
      (_, i): Player => ({
        externalId: i,
        position: Position.DB,
      })
    );

    sfs = await SFS.initializeRoot(
      connection,
      wallet,
      wallet.publicKey,
      players,
      0,
      programAccount.publicKey
    );

    const root = await sfs.getRootInfo();
  }
})().catch(console.error);
