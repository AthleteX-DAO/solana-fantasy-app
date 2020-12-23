import { Connection, Account, PublicKey } from '@solana/web3.js';
import { arrayify } from '@ethersproject/bytes';
import { SFS } from '../../front-end/src/sdk/sfs';


let key = 'devnet';
let options = {
  privateKey: '',
  connection: '',
  programId: '',
  publicKey: ''
}

switch (key) {
  case 'devnet':
    options.privateKey = '0x0e9cd4917a7a6d0d9d8851f42df54c73f608e49c0a473552ea1b34da329908e4795e0f95315992fc7ecc17a7d63f7ee455b4dafa0a70eb5cb76f607944f5d9cc';
    options.connection = 'https://devnet.solana.com';
    options.programId = 'Dp4skonbWvN4vcGn8brhTZjCq7dPwTSThdufpkiFtdYC';
    options.publicKey = '3RWZuNZ5vrHDiN8n6K3ZsHdJyseswcyqxXAg166cbibD';
    break;

  case 'testnet':
    options.privateKey = '';
    options.connection = '';
    options.programId = '';
    options.publicKey = '';
    break;
    
  case 'mainnet':
  options.privateKey = '';
  options.connection = '';
  options.programId = '';
  options.publicKey = '';
  break;
}

export const connection = new Connection(options.connection);
const privateKey = options.privateKey;

export const wallet = new Account(arrayify(privateKey));

console.log('Wallet loaded', wallet.publicKey.toBase58());

// localnet program
// export const programId = new PublicKey('FHmhZ4znQyoLVQnqxT3LMNn9RACPyvmAuqJ4xqo3133W');
// export const rootPublicKey = new PublicKey('3WSGdDabgaPZfG2ZrqCBNv1FoHV68bvv7T4sWCKwYTxm');

// devnet program
// export const programId = new PublicKey('Dp4skonbWvN4vcGn8brhTZjCq7dPwTSThdufpkiFtdYC');
// export const rootPublicKey = new PublicKey('3RWZuNZ5vrHDiN8n6K3ZsHdJyseswcyqxXAg166cbibD');




export const programId = new PublicKey(options.programId);
export const rootPublicKey = new PublicKey(options.publicKey);
const bankPromise = PublicKey.findProgramAddress([Buffer.from([0])], programId);
export const sfsFn = async () =>
  new SFS(connection, rootPublicKey, programId, (await bankPromise)[0]);
