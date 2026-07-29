import { Command } from 'commander';
import { initContext, readContext, writeContext } from '../utils/context.js';
import { runAssess } from './assess.js';
import { runEstimate } from './estimate.js';

export const pipelineCommand = new Command('pipeline')
  .description('Orchestrate the funky pipeline: init → assess → estimate');

pipelineCommand
  .command('assess')
  .description('Run assess with shared pipeline context')
  .action(() => {
    const targetBase = process.cwd();

    // Init context if missing
    let ctx = readContext(targetBase);
    if (!ctx) {
      ctx = initContext();
      writeContext(targetBase, ctx);
    }

    runAssess(targetBase, { context: true });
    process.exit(0);
    return;
  });

pipelineCommand
  .command('estimate')
  .description('Run estimate with shared pipeline context')
  .action(() => {
    const targetBase = process.cwd();

    // Validate context exists
    const ctx = readContext(targetBase);
    if (!ctx) {
      console.error('❌ Pipeline context not found. Run "funky pipeline assess" first.');
      process.exit(1);
      return;
    }

    // Validate assess has been run
    if (!ctx.assess?.runAt) {
      console.error('❌ Assess has not been run yet. Run "funky pipeline assess" first.');
      process.exit(1);
      return;
    }

    runEstimate(targetBase, { context: true });
    process.exit(0);
    return;
  });

pipelineCommand
  .command('all')
  .description('Run full pipeline: assess → estimate')
  .action(() => {
    const targetBase = process.cwd();

    // Init context if missing
    let ctx = readContext(targetBase);
    if (!ctx) {
      ctx = initContext();
      writeContext(targetBase, ctx);
    }

    // Run assess
    try {
      runAssess(targetBase, { context: true });
      console.log('\n✅ Assess complete. Running estimate...\n');
    } catch (err) {
      console.error('❌ Assess failed:', err.message);
      process.exit(1);
      return;
    }

    // Run estimate (only if assess succeeded)
    try {
      runEstimate(targetBase, { context: true });
      console.log('\n✅ Pipeline complete!');
    } catch (err) {
      console.error('❌ Estimate failed:', err.message);
      process.exit(1);
      return;
    }

    process.exit(0);
    return;
  });

pipelineCommand
  .command('status')
  .description('Show current pipeline status')
  .action(() => {
    const targetBase = process.cwd();
    const ctx = readContext(targetBase);

    if (!ctx) {
      console.log('📋 Pipeline not started.');
      console.log('Run "funky pipeline assess" to begin.');
      process.exit(0);
      return;
    }

    console.log('📋 Pipeline Status');
    console.log('──────────────────');
    console.log(`Created: ${ctx.createdAt}`);
    console.log('');

    // Assess state
    console.log('🔍 Assess:');
    console.log(`  ${ctx.assess?.runAt ? 'Completed: ' + ctx.assess.runAt : '⏳ Not run yet'}`);
    if (ctx.assess?.dynamicQuestions?.length) {
      console.log(`  Dynamic questions: ${ctx.assess.dynamicQuestions.length}`);
    }
    console.log('');

    // Estimate state
    console.log('💰 Estimate:');
    console.log(`  ${ctx.estimate?.runAt ? 'Completed: ' + ctx.estimate.runAt : '⏳ Not run yet'}`);
    console.log('');

    // Pipeline progress
    console.log('📊 Progress:');
    const completed = ctx.pipeline?.completed || [];
    if (completed.length > 0) {
      completed.forEach(s => console.log(`  ✅ ${s}`));
    } else if (ctx.assess?.runAt) {
      console.log('  ✅ assess');
      console.log('  ⏳ estimate — pending');
    } else {
      console.log('  ⏳ Not started');
    }

    process.exit(0);
    return;
  });
