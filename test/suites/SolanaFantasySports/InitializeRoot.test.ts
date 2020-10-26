import { Account } from '@solana/web3.js';
import { Player } from '../../../sdk/instruction';
import { SFS } from '../../../sdk/sfs';
import { GAMES_COUNT, Position, Score, PLAYERS_CAPACITY } from '../../../sdk/state';

const rootAccount = new Account();

export const InitializeRoot = () =>
  describe('Initialize root', () => {
    it('Initialize root account', async () => {
      console.log('Initializing root account', rootAccount.publicKey.toBase58());

      const sfs = await SFS.initializeRoot(
        global.connection,
        global.payerAccount,
        global.payerAccount.publicKey,
        Array.from({ length: PLAYERS_CAPACITY }).map(
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
        ),
        global.solanaFantasySportsPPK
      );
    });

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
