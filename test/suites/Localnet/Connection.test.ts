import { Account, Connection } from '@solana/web3.js';
import { strictEqual } from 'assert';

export const ConnectionTest = () =>
  describe('Connection', () => {
    it('queries version on the node', async () => {
      const url = 'http://localhost:8899';
      global.connection = new Connection(url, 'recent');

      const version = await global.connection.getVersion();
      console.log('Connection url and version:', url, version);
    });

    it('requests 100 Sol airdrop to a wallet', async () => {
      global.payerAccount = new Account();

      const balanceBefore = await global.connection.getBalance(global.payerAccount.publicKey);
      strictEqual(balanceBefore, 0, 'balance should be 0 Sol initially');

      const tx = await global.connection.requestAirdrop(
        global.payerAccount.publicKey,
        100 * 10 ** 9
      );
      console.log('request airdrop tx hash', tx);

      // putting a wait for tx to confirm
      await new Promise((r) => setTimeout(r, 500));

      const balanceAfter = await global.connection.getBalance(global.payerAccount.publicKey);
      strictEqual(balanceAfter, 100 * 10 ** 9, 'balance should be 100 Sol after airdrop');
    });
  });
