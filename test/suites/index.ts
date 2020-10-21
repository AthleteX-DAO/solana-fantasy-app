import { Localnet } from './Localnet';
import { HelloWorld } from './HelloWorld';
import { SolanaFantasySports } from './SolanaFantasySports';

export const TestCases = () =>
  describe('Test Cases', () => {
    Localnet();
    // HelloWorld();
    SolanaFantasySports();
  });
