import { Account, BpfLoader, BPF_LOADER_PROGRAM_ID } from '@solana/web3.js';
import { ok, strictEqual } from 'assert';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { connection, sfsFn, wallet } from './commons';
import { SFS } from '../../front-end/src/sdk/sfs';
import {
  PLAYERS_CAPACITY,
  Position,
  Stage,
  LEAGUE_USERS_CAPACITY,
} from '../../front-end/src/sdk/state';
import { Player } from '../../front-end/src/sdk/instruction';
import { getPlayerList } from '../src/players-list';

connection;

(async () => {
  // const sfs = await sfsFn();
  const programAccount = new Account();

  {
    // await connection.requestAirdrop(wallet.publicKey, 25 * 10 ** 9);
    // console.log('requested for airdrop');

    // await new Promise((res) => setTimeout(res, 1000));

    const data = readFileSync(
      resolve(__dirname, '../../contracts/solana-fantasy-sports/solana_fantasy_sports.so'),
      {
        encoding: 'hex',
      }
    );
    console.log(data.slice(0, 10));

    const balanceBefore = await connection.getBalance(wallet.publicKey);
    if (balanceBefore < 20999980000) {
      throw new Error('Balance is a bit low, it will cause tx to fail. Please request airdrop');
    }

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
  let sfs: SFS;
  {
    console.log('Initializing root account');

    const allPlayers = await getPlayerList();
    console.log('allPlayers.length', allPlayers.length);

    //   Uninitialized,
    // RB,
    // LB,
    // DL,
    // TE,
    // DB,
    // QB,
    // WR,
    // OL,
    const choosenPlayers: Player[] = [];

    // .slice(0, PLAYERS_CAPACITY).map(
    for (let i = 0; choosenPlayers.length < PLAYERS_CAPACITY; i++) {
      let position: Position;
      let p = allPlayers[i];
      if (!p) {
        break;
      }
      // console.log(i, p.Position);

      switch (p.Position) {
        case 'RB':
          position = Position.RB;
          break;
        case 'WR':
          position = Position.WR;
          break;
        case 'QB':
          position = Position.QB;
          break;
        case 'TE':
          position = Position.TE;
          break;
        case 'K':
          position = Position.K;
          break;
        case 'DEF':
          position = Position.DEF;
          break;
        default:
          throw new Error(`Position from API not recognized: ${p.Position}`);
      }
      choosenPlayers.push({
        externalId: p.PlayerID,
        position,
      });
    }
    console.log(choosenPlayers.length);

    sfs = await SFS.initializeRoot(
      connection,
      wallet,
      wallet.publicKey,
      choosenPlayers,
      0,
      programAccount.publicKey
    );

    // const players = Array.from({ length: PLAYERS_CAPACITY }).map(
    //   (_, i): Player => ({
    //     externalId: i,
    //     position: Position.RB,
    //   })
    // );

    // sfs = await SFS.initializeRoot(
    //   connection,
    //   wallet,
    //   wallet.publicKey,
    //   players,
    //   0,
    //   programAccount.publicKey
    // );

    await sfs.getRootInfo();

    // @ts-ignore
    const rootPublicKey: PublicKey = sfs.publicKey;
    console.log('rootPublicKey', rootPublicKey.toBase58());
  }
})().catch(console.error);
