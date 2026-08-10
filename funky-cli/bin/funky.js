#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from '../src/commands/init.js';
import { scaffoldCommand } from '../src/commands/scaffold.js';
import { sddCommand } from '../src/commands/sdd.js';
import { assessCommand } from '../src/commands/assess.js';
import { featureCommand } from '../src/commands/feature.js';
import { estimateCommand } from '../src/commands/estimate.js';
import { engramCommand } from '../src/commands/engram.js';
import { pipelineCommand } from '../src/commands/pipeline.js';
import { skillsCommand } from '../src/commands/skills.js';
import { secureCommand } from '../src/commands/secure.js';
import { enrichCommandHelp } from '../src/utils/help.js';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

const program = new Command();

program
  .name('funky')
  .description('Funky AI System CLI')
  .version(pkg.version);

program.addCommand(initCommand);
program.addCommand(sddCommand);
program.addCommand(scaffoldCommand);
program.addCommand(assessCommand);
program.addCommand(featureCommand);
program.addCommand(estimateCommand);
program.addCommand(engramCommand);
program.addCommand(pipelineCommand);
program.addCommand(skillsCommand);
program.addCommand(secureCommand);

// Help enriquecido con data viva del doc del comando (R-HL-1/2): inyecta vía
// addHelpText('after'); no-op sin doc o con placeholder <ruta-del-doc>.
for (const cmd of program.commands) {
  enrichCommandHelp(cmd, cmd.name());
}

program.parse(process.argv);
