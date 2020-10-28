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
  const programAccount = new Account(_secretKey);

  return {
    get publicKey() {
      return programAccount.publicKey.toBase58();
    },
    get privateKey() {
      const _secretKey = this.callback(
        'Do you want to export private key?',
        (programAcc: Account) => {
          return programAcc.secretKey;
        }
      );
      return hexlify(_secretKey);
    },
    callback(description: string, fn: (programAcc: Account) => any): any {
      if (window.confirm(description)) {
        return fn(programAccount);
      }
    },
  };
}

// @ts-ignore
window.CreateClojuredWallet = CreateClojuredWallet;
