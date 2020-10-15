import { LoadProgram } from './LoadProgram.test';
import { Greet } from './Greet.test';

export const HelloWorld = () =>
  describe('Hello World', () => {
    LoadProgram();
    Greet();
  });
