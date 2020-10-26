import { LoadProgram } from './LoadProgram.test';
import { InitializeRoot } from './InitializeRoot.test';
import { InstructionsTests } from './Instructions.test';
import { DraftSelection } from './DraftSelection.test';

export const SolanaFantasySports = () =>
  describe('Solana Fantasy Sports', () => {
    DraftSelection();
    InstructionsTests();
    LoadProgram();
    InitializeRoot();
  });
