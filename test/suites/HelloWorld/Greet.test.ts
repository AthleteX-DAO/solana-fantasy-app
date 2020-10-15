import {
  Account,
  sendAndConfirmTransaction,
  Transaction,
  TransactionInstruction,
  SystemProgram,
} from '@solana/web3.js';
import { strictEqual } from 'assert';
const BufferLayout = require('buffer-layout');

// account to greet to
const greetAccount = new Account();

const greetedAccountDataLayout = BufferLayout.struct([BufferLayout.u32('numGreets')]);

export const Greet = () =>
  describe('Greet', () => {
    it('create a greeting account', async () => {
      console.log('Creating account', greetAccount.publicKey.toBase58(), 'to say hello to');
      const space = greetedAccountDataLayout.span;
      const lamports = await global.connection.getMinimumBalanceForRentExemption(
        greetedAccountDataLayout.span
      );

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: global.payerAccount.publicKey,
          newAccountPubkey: greetAccount.publicKey,
          lamports,
          space,
          programId: global.helloWorldPPK,
        })
      );

      const balancePayer = await global.connection.getBalance(global.payerAccount.publicKey);
      console.log(balancePayer);
      const balanceGreet = await global.connection.getBalance(greetAccount.publicKey);
      console.log(balanceGreet);

      await sendAndConfirmTransaction(
        global.connection,
        transaction,
        [global.payerAccount, greetAccount],
        { skipPreflight: false, commitment: 'recent', preflightCommitment: 'recent' }
      );
    });

    it('calls greet on the program on the network and checks if greetings incremented', async () => {
      const instruction = new TransactionInstruction({
        keys: [{ pubkey: greetAccount.publicKey, isSigner: false, isWritable: true }],
        programId: global.helloWorldPPK,
        data: Buffer.alloc(0), // All instructions are hellos
      });

      const numGreetsBefore = await getNumberOfGreetings();
      strictEqual(numGreetsBefore, 0, 'num greets should be 0 initially');

      await sendAndConfirmTransaction(
        global.connection,
        new Transaction().add(instruction),
        [global.payerAccount],
        { skipPreflight: false, commitment: 'recent', preflightCommitment: 'recent' }
      );

      const numGreetsAfter = await getNumberOfGreetings();
      strictEqual(numGreetsAfter, 1, 'num greets should be 1 after a greet');
    });
  });

async function getNumberOfGreetings(): Promise<number> {
  const accountInfo = await global.connection.getAccountInfo(greetAccount.publicKey);
  if (accountInfo === null) {
    throw 'Error: cannot find the greeted account';
  }
  const info: { numGreets: number } = greetedAccountDataLayout.decode(
    Buffer.from(accountInfo.data)
  );
  return info.numGreets;
}
