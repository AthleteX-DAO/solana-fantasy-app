import { Connection, Account, PublicKey } from '@solana/web3.js';
import { SFS } from '../sdk/sfs';

declare global {
  namespace NodeJS {
    interface Global {
      connection: Connection;
      payerAccount: Account;
      secondAccount: Account;
      helloWorldPPK: PublicKey; // PPK => Program Public Key
      solanaFantasySportsPPK: PublicKey;
      sfs: SFS;
    }
  }
}
