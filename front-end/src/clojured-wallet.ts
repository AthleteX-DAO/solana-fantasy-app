import { Account, PublicKey } from '@solana/web3.js';
import { arrayify, hexlify, isHexString } from '@ethersproject/bytes';

export type ClojuredWallet = {
  readonly publicKey: string;
  readonly privateKey: string;
  callback(description: string, fn: (programAcc: Account) => any): any;
};

export function CreateClojuredWallet(secretKey?: string): ClojuredWallet {
  let _secretKey: Uint8Array | undefined;
  if (typeof secretKey === 'string') {
    if (!isHexString(secretKey)) {
      throw new Error('Private key should be a hex string');
    }
    if (secretKey.length !== 130) {
      throw new Error('Private key should be a 64 bytes hex string');
    }
    _secretKey = arrayify(secretKey);
  }
  const account = new Account(_secretKey);

  return {
    get publicKey() {
      return account.publicKey.toBase58();
    },
    get privateKey() {
      const _secretKey = this.callback(
        'This will show you you Private/Public Key Hash.. continue?',
        (account: Account) => {
          return account.secretKey;
        }
      );
      return hexlify(_secretKey);
    },
    callback(description: string, fn: (account: Account) => any): any {
      if (window.confirm(description)) {
        return fn(account);
      } else {
        throw new Error('User denied signature');
      }
    },
  };
}

// @ts-ignore
window.CreateClojuredWallet = CreateClojuredWallet;
