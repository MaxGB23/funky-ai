#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from '../src/commands/init.js';
import { phaseCommand } from '../src/commands/phase.js';
import { releaseCommand } from '../src/commands/release.js';
import { assessCommand } from '../src/commands/assess.js';

const program = new Command();

program
  .name('funky')
  .description('Funky AI System CLI')
  .version('1.0.0');

program.addCommand(initCommand);
program.addCommand(phaseCommand);
program.addCommand(releaseCommand);
program.addCommand(assessCommand);

program.parse(process.argv);
