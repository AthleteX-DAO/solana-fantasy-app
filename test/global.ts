import { Connection, Account, PublicKey } from '@solana/web3.js';

declare global {
  namespace NodeJS {
    interface Global {
      connection: Connection;
      payerAccount: Account;
      helloWorldPPK: PublicKey; // PPK => Program Public Key
    }
  }
}
