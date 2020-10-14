import { Connection } from '@solana/web3.js';

export const Localnet = () => describe('Localnet', () => {
  it('queries version on the node', async () => {
    const url = 'http://localhost:8899';
    global.connection = new Connection(url, 'recent');

    const version = await global.connection.getVersion();
    console.log('Connection url and version:', url, version);
  })
})