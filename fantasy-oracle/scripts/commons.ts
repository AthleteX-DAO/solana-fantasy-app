import { Connection, Account, PublicKey } from '@solana/web3.js';
import { arrayify } from '@ethersproject/bytes';

// export const connection = new Connection('https://devnet.solana.com', 'recent');
export const connection = new Connection('http://localhost:8899', 'recent');

const privateKey =
  '0x0e9cd4917a7a6d0d9d8851f42df54c73f608e49c0a473552ea1b34da329908e4795e0f95315992fc7ecc17a7d63f7ee455b4dafa0a70eb5cb76f607944f5d9cc';

export const wallet = new Account(arrayify(privateKey));

console.log('Wallet loaded', wallet.publicKey.toBase58());

export const programId = new PublicKey('CvGkZJjQocKHJUHcpxUPGSy15MDf94LWJEJ1S9Q6qkH9');
export const rootPublicKey = new PublicKey('ADsPv16735sU87wNiH4EN2T6p9g996aJnYS3m8RYYWMf');
