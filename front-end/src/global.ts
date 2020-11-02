import { PublicKey } from '@solana/web3.js';
import { ClojuredWallet } from './clojured-wallet';

declare global {
  interface Window {
    wallet: ClojuredWallet | undefined;
    walletStatusChangeHooks: { navbar: Function; walletPage: Function };
    leagueTabHook: Function;
    sfsProgramId: PublicKey;
    sfsRoot: PublicKey;
  }
}

export {};
