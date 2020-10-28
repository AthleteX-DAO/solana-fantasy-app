import { ClojuredWallet } from './clojured-wallet';

declare global {
  interface Window {
    wallet: ClojuredWallet | undefined;
  }
}

export {};
