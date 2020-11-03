import { Connection, PublicKey, Account } from '@solana/web3.js';
import { ClojuredWallet } from './clojured-wallet';
import { SFS } from './sdk/sfs';
import { Buffer as Buffer_ } from 'buffer';

declare global {
  interface Window {
    Buffer: typeof Buffer_;
    wallet: ClojuredWallet | undefined;
    walletStatusChangeHooks: { navbar: Function; walletPage: Function };
    leagueTabHook: Function;
    sfsProgramId: PublicKey;
    sfsRoot: PublicKey;
    connection: Connection;
    sfsSDK: (wallet: ClojuredWallet) => SFS;
  }
}

export {};
