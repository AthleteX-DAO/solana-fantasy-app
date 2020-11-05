import { LoadProgram } from './LoadProgram.test';
import { InitializeRoot } from './InitializeRoot.test';
import { InstructionsTests } from './Instructions.test';
import { UpdateLineup } from './UpdateLineup.test';
import { DraftSelection } from './DraftSelection.test';
import { CreateLeague } from './CreateLeague.test';
import { JoinLeague } from './JoinLeague.test';
import { UpdatePlayerScore } from './UpdatePlayerScore.test';
import { PlayerSwaps } from './PlayerSwaps.test';

export const SolanaFantasySports = () =>
  describe('Solana Fantasy Sports', () => {
    // InstructionsTests();
    LoadProgram();
    InitializeRoot();
    CreateLeague();
    JoinLeague();
    DraftSelection();
    UpdatePlayerScore();
    UpdateLineup();
    PlayerSwaps();
  });
