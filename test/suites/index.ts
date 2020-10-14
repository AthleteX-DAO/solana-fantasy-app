import { Localnet } from './Localnet';
import { HelloWorld } from './HelloWorld';

export const TestCases = () =>
  describe('Test Cases', () => {
    Localnet();
    HelloWorld();
  });
