import { LoadProgram } from './LoadProgram.test';
import { InitializeRoot } from './InitializeRoot.test';
import { InstructionsTests } from './Instructions.test';

export const SolanaFantasySports = () =>
  describe('Solana Fantasy Sports', () => {
    InstructionsTests();
    LoadProgram();
    InitializeRoot();
  });
