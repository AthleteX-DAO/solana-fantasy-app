import { PublicKey } from '@solana/web3.js';
import { ok, strictEqual, throws, doesNotThrow, fail } from 'assert';
import { u64 } from '../../../sdk/util/layout';

export const JoinLeague = () =>
  describe('Join league', () => {
    it('Joins league', async () => {
      const bank = (global.sfs as any).bank as PublicKey;

      const balanceBefore = await global.connection.getBalance(bank);

      await global.sfs.joinLeague(global.secondAccount, 0);

      const balanceAfter = await global.connection.getBalance(bank);

      const root = await global.sfs.getRootInfo();
      const league = root.leagues[0];

      strictEqual(league.userStateLength, 2, 'should be 2 player joined');
      strictEqual(balanceAfter - balanceBefore, league.bid.toNumber(), 'should transfer funds');

      const userState = league.userStates[1];
      strictEqual(userState.isInitialized, true, 'userState should be initialized');
      strictEqual(
        userState.pubKey.toBase58(),
        global.secondAccount.publicKey.toString(),
        'should correctly set first player pubkey'
      );

      let error;
      try {
        await global.sfs.joinLeague(global.secondAccount, 0);
      } catch (e) {
        error = e;
      }
      ok(error, 'should not allow double join');

      // doesNotThrow(async () => {
      //   await global.sfs.joinLeague(global.secondAccount, 0);
      // }, 'should not allow double join');
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
