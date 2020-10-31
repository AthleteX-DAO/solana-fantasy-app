import { ClojuredWallet } from './clojured-wallet';

declare global {
  interface Window {
    wallet: ClojuredWallet | undefined;
    walletStatusChangeHooks: { navbar: Function; walletPage: Function };
    leagueTabHook: Function;
  }
}

export {};
