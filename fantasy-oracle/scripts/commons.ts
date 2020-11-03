import { Connection, Account, PublicKey } from '@solana/web3.js';
import { arrayify } from '@ethersproject/bytes';
import { SFS } from '../../sdk/sfs';

// export const connection = new Connection('https://devnet.solana.com', 'recent');
export const connection = new Connection('http://localhost:8899', 'recent');

const privateKey =
  '0x0e9cd4917a7a6d0d9d8851f42df54c73f608e49c0a473552ea1b34da329908e4795e0f95315992fc7ecc17a7d63f7ee455b4dafa0a70eb5cb76f607944f5d9cc';

export const wallet = new Account(arrayify(privateKey));

console.log('Wallet loaded', wallet.publicKey.toBase58());

// localnet program
export const programId = new PublicKey('FHmhZ4znQyoLVQnqxT3LMNn9RACPyvmAuqJ4xqo3133W');
export const rootPublicKey = new PublicKey('3WSGdDabgaPZfG2ZrqCBNv1FoHV68bvv7T4sWCKwYTxm');

// devnet program
// export const programId = new PublicKey('yX8ip4PTAZs261A7s5ZaZjzMYbPjEeRjWYArDA7sZjf');
// export const rootPublicKey = new PublicKey('6P4JL1Hc9d1pKnWHeV99Bq3BZRSLudCKM9fi1cCnp3sj');
const bankPromise = PublicKey.findProgramAddress([Buffer.from([0])], programId);
export const sfsFn = async () =>
  new SFS(connection, rootPublicKey, programId, (await bankPromise)[0]);
