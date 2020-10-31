import { Account, Connection } from '@solana/web3.js';
import { strictEqual } from 'assert';
import { url } from './url';

export const ConnectionTest = () =>
  describe('Connection', () => {
    it('queries version on the node', async () => {
      global.connection = new Connection(url, 'recent');

      const version = await global.connection.getVersion();
      console.log('Connection url and version:', url, version);
    });

    it('requests 100 Sol airdrop to a wallet', async () => {
      global.payerAccount = new Account();
      console.log('Payer public key: ', global.payerAccount.publicKey.toBase58());

      const balanceBefore = await global.connection.getBalance(global.payerAccount.publicKey);
      strictEqual(balanceBefore, 0, 'balance should be 0 Sol initially');

      const tx = await global.connection.requestAirdrop(
        global.payerAccount.publicKey,
        100 * 10 ** 9
      );
      console.log('request airdrop tx hash', tx);

      while ((await global.connection.getBalance(global.payerAccount.publicKey)) === 0) {
        await new Promise((r) => setTimeout(r, 250));
      }

      const balanceAfter = await global.connection.getBalance(global.payerAccount.publicKey);
      strictEqual(balanceAfter, 100 * 10 ** 9, 'balance should be 100 Sol after airdrop');
    });
    it('requests 100 Sol airdrop to a second wallet', async () => {
      global.secondAccount = new Account();
      console.log('Payer public key: ', global.secondAccount.publicKey.toBase58());

      const balanceBefore = await global.connection.getBalance(global.secondAccount.publicKey);
      strictEqual(balanceBefore, 0, 'balance should be 0 Sol initially');

      const tx = await global.connection.requestAirdrop(
        global.secondAccount.publicKey,
        100 * 10 ** 9
      );
      console.log('request airdrop tx hash', tx);

      while ((await global.connection.getBalance(global.secondAccount.publicKey)) === 0) {
        await new Promise((r) => setTimeout(r, 250));
      }

      const balanceAfter = await global.connection.getBalance(global.secondAccount.publicKey);
      strictEqual(balanceAfter, 100 * 10 ** 9, 'balance should be 100 Sol after airdrop');
    });
  });
