import { Connection } from '@solana/web3.js';

declare global {
  namespace NodeJS {
    interface Global {
      connection: Connection;
    }
  }
}