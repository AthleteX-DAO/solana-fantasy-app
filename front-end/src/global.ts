import { Connection, PublicKey, Account } from '@solana/web3.js';
import { ClojuredWallet } from './clojured-wallet';
import { SFS } from './sdk/sfs';
import { Buffer as Buffer_ } from 'buffer';
import { Root } from './sdk/state';

declare global {
  interface Window {
    Buffer: typeof Buffer_;
    wallet: ClojuredWallet | undefined;
    walletStatusChangeHooks: { navbar: Function; walletPage: Function };
    leagueTabHook: Function;
    sfsProgramId: PublicKey;
    sfsRoot: PublicKey;
    connection: Connection;
    sfsSDK: () => Promise<SFS>;
    getCachedRootInfo: (forceUpdate?: boolean) => Promise<Root>;
  }
}

export {};
