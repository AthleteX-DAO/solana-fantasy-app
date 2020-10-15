import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Account, BpfLoader, BPF_LOADER_DEPRECATED_PROGRAM_ID } from '@solana/web3.js';
import { strictEqual } from 'assert';

export const LoadProgram = () =>
  describe('Load Program', () => {
    it('loads program to the localnet', async () => {
      const data = readFileSync(resolve(__dirname, '../../../build/hello_world.so'), {
        encoding: 'hex',
      });
      const programAccount = new Account();
      // const payerAccount = new Account();

      // console.log(data.slice(0, 10));

      const balanceBefore = await global.connection.getBalance(global.payerAccount.publicKey);
      // console.log(balanceBefore);

      const isLoaded = await BpfLoader.load(
        global.connection,
        global.payerAccount,
        programAccount,
        Buffer.from(data, 'hex'),
        BPF_LOADER_DEPRECATED_PROGRAM_ID
      );

      strictEqual(isLoaded, true, 'load method should return true');

      global.helloWorldPPK = programAccount.publicKey;

      const balanceAfter = await global.connection.getBalance(global.payerAccount.publicKey);
      // console.log(balanceAfter);

      console.log('fees for deploy tx', (balanceBefore - balanceAfter) / 10 ** 9, 'sol');
    });
  });
