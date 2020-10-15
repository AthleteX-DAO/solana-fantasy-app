import {
  Account,
  sendAndConfirmTransaction,
  Transaction,
  TransactionInstruction,
  SystemProgram,
} from '@solana/web3.js';
const BufferLayout = require('buffer-layout');

// account to greet to
const greetAccount = new Account();

const greetedAccountDataLayout = (BufferLayout.struct([
  BufferLayout.u32('numGreets'),
]) as unknown) as { span: number };

export const Greet = () =>
  describe('Greet', () => {
    it('adds balance to greet account', async () => {
      const tx = await global.connection.requestAirdrop(greetAccount.publicKey, 100 * 10 ** 9);
      console.log('request airdrop tx hash', tx);

      // putting a wait for tx to confirm
      await new Promise((r) => setTimeout(r, 500));

      const balanceAfter = await global.connection.getBalance(greetAccount.publicKey);
      console.log(balanceAfter);
    });

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
      await sendAndConfirmTransaction(global.connection, transaction, [
        global.payerAccount,
        greetAccount,
      ]);
      // const transaction = new Transaction().add(
      //   SystemProgram.createAccount({
      //     fromPubkey: global.payerAccount.publicKey,
      //     newAccountPubkey: greetAccount.publicKey,
      //     lamports,
      //     space,
      //     programId: global.helloWorldPPK,
      //   }),
      // );
      // await sendAndConfirmTransaction(
      //   // 'createAccount',
      //   global.connection,
      //   transaction,
      //   [global.payerAccount, greetAccount],
      // );
    });

    it('calls greet on the program on the network', async () => {
      const instruction = new TransactionInstruction({
        keys: [{ pubkey: greetAccount.publicKey, isSigner: false, isWritable: true }],
        programId: global.helloWorldPPK,
        data: Buffer.alloc(0), // All instructions are hellos
      });

      const tx = await sendAndConfirmTransaction(
        global.connection,
        new Transaction().add(instruction),
        [global.payerAccount]
      );

      console.log(tx);
    });
  });
