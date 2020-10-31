import { PublicKey } from '@solana/web3.js';
import { ok, strictEqual } from 'assert';
import { u64 } from '../../../sdk/util/layout';

export const CreateLeague = () =>
  describe('Create league', () => {
    it('Creates league', async () => {
      const bank = (global.sfs as any).bank as PublicKey;

      const balanceBefore = await global.connection.getBalance(bank);

      const leagueId = await global.sfs.createLeague(
        global.payerAccount,
        'Test League',
        1 * 10 ** 9,
        10
      );

      const balanceAfter = await global.connection.getBalance(bank);

      console.log(`League id ${leagueId}`);

      const root = await global.sfs.getRootInfo();
      const league = root.leagues[leagueId];

      strictEqual(league.userStateLength, 1, 'should be 1 player joined');
      strictEqual(league.isInitialized, true, 'league should be initialized');
      strictEqual(league.name, 'Test League', 'should correctly set name');
      strictEqual(league.usersLimit, 10, 'should correctly set users limit');
      strictEqual(league.currentPick, 0, 'should correctly set currentPick');
      strictEqual(
        league.bid.toString(),
        new u64(1 * 10 ** 9).toString(),
        'should correctly set bid'
      );
      strictEqual(balanceAfter - balanceBefore, 1 * 10 ** 9, 'should transfer funds');

      const userState = league.userStates[0];
      strictEqual(userState.isInitialized, true, 'userState should be initialized');
      strictEqual(
        userState.pubKey.toBase58(),
        global.payerAccount.publicKey.toString(),
        'should correctly set first player pubkey'
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
