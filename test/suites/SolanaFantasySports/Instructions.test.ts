import { Account } from '@solana/web3.js';
import { deepStrictEqual, strictEqual } from 'assert';
import { Buffer } from 'buffer';
import { SfsInstruction, Player, PlayerLayout } from '../../../sdk/instruction';
import { SFS } from '../../../sdk/sfs';
import {
  GAMES_COUNT,
  Position,
  Score,
  ScoreLayout,
  PLAYERS_CAPACITY,
  PUB_KEY_LEN,
  RootLayout,
} from '../../../sdk/state';
import { BufferLayout } from '../../../sdk/util/layout';

const someAccount = new Account();

export const InstructionsTests = () => {
  describe('Create createInitializeRootInstruction', () => {
    // const a = Buffer.from([1,2,3]);
    // a.writeUIntLE(3, 0, 8);
    // const a = Buffer.alloc(PlayerLayout.span);
    // console.log(PlayerLayout.span);
    // console.log(PlayerLayout.encode({
    //   id: 1,
    //   position: Position.DB,
    //   scores: [...new Array(GAMES_COUNT)]
    //   .map((): Score => ({
    //     score1: 1,
    //     isInitialized: true
    //   })),
    //   isInitialized: true
    // },a));
    // console.log(a);
    // throw a;
    const players = Array.from({ length: PLAYERS_CAPACITY }).map(
      (x, i): Player => ({
        externalId: i,
        position: Position.DB,
        // scores: Array.from({ length: GAMES_COUNT }).map(
        //   (): Score => ({
        //     score1: 1,
        //     isInitialized: true,
        //   })
        // ),
        // isInitialized: true,
      })
    );

    const data = SfsInstruction.createInitializeRootInstruction(
      someAccount.publicKey,
      someAccount.publicKey,
      someAccount.publicKey,
      0
    );

    it('correctly serialize instruction', async () => {
      console.log(data.data);
      strictEqual(ScoreLayout.span, 2);
      strictEqual(PlayerLayout.span, 2 + 1);
      strictEqual(data.data.length, 1 + 1 + PUB_KEY_LEN);

      // it('calls InitializeRoot on the program on the network', async () => {
      //   const instruction = new TransactionInstruction({
      //     keys: [{ pubkey: rootAccount.publicKey, isSigner: false, isWritable: true }],
      //     programId: global.solanaFantasySportsPPK,
      //     data: Buffer.alloc(0), // All instructions are hellos
      //   });

      //   const numGreetsBefore = await getNumberOfGreetings();
      //   strictEqual(numGreetsBefore, 0, 'num greets should be 0 initially');

      //   await sendAndConfirmTransaction(
      //     global.connection,
      //     new Transaction().add(instruction),
      //     [global.payerAccount],
      //     { skipPreflight: false, commitment: 'recent', preflightCommitment: 'recent' }
      //   );

      //   const numGreetsAfter = await getNumberOfGreetings();
      //   strictEqual(numGreetsAfter, 1, 'num greets should be 1 after a greet');
      // });
    });
  });
  describe('Create createLeagueInstruction', async () => {
    const data = SfsInstruction.createCreateLeagueInstruction(
      someAccount.publicKey,
      someAccount.publicKey,
      someAccount.publicKey,
      'test',
      8,
      10,
      someAccount.publicKey
    );

    it('correctly serialize instruction', async () => {
      console.log(data.data);
      // strictEqual(ScoreLayout.span, 2);
      // strictEqual(PlayerLayout.span, 2 + 1);
      // strictEqual(data.data.length, 1 + PUB_KEY_LEN);
    });
  });

  // async function getNumberOfGreetings(): Promise<number> {
  //   const accountInfo = await global.connection.getAccountInfo(rootAccount.publicKey);
  //   if (accountInfo === null) {
  //     throw Error('Error: cannot find the root account');
  //   }
  //   console.log(accountInfo);

  //   const info: { numGreets: number } = rootAccountDataLayout.decode(
  //     Buffer.from(accountInfo.data)
  //   );
  //   return info.numGreets;
  // }
};
