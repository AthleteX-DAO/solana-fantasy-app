import './global';
import { Connection } from '@solana/web3.js';
import { TestCases } from './suites';

describe('Solana', () => {
  before(async () => {
    const url = 'http://localhost:8899';
    global.connection = new Connection(url, 'recent');
    const version = await global.connection.getVersion();
    console.log('Connection to cluster established:', url, version);
  });

  TestCases();
})