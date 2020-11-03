import { Connection, PublicKey, Account } from '@solana/web3.js';
import { ClojuredWallet } from './clojured-wallet';
import { SFS } from './sdk/sfs';

declare global {
  interface Window {
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
