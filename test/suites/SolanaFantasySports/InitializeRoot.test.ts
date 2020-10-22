import { Account } from '@solana/web3.js';
import { SFS } from '../../../sdk/sfs';
import { GAMES_COUNT, Player, Position, Score, TOTAL_PLAYERS_COUNT } from '../../../sdk/state';

const rootAccount = new Account();

export const InitializeRoot = () =>
  describe('Create account', () => {
    it('create root account', async () => {
      console.log('Creating root account', rootAccount.publicKey.toBase58());

      const sfs = await SFS.initializeRoot(
        global.connection,
        global.payerAccount,
        global.payerAccount.publicKey,
        Array.from({ length: TOTAL_PLAYERS_COUNT }).map(
          (): Player => ({
            id: 1,
            position: Position.DB,
            scores: Array.from({ length: GAMES_COUNT }).map(
              (): Score => ({
                score1: 1,
                isInitialized: true,
              })
            ),
            isInitialized: true,
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
