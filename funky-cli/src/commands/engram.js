import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { input, select } from '@inquirer/prompts';

export const runEngramAdd = async ({ tag, category, desc, cwd }) => {
  const sanitizeName = (str) => str.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
  
  if (!tag) {
    tag = await input({ message: 'Ingresá el tag del engrama (ej. [fix-auth]):' });
  }
  if (!category) {
    category = await select({
      message: 'Seleccioná la categoría del engrama:',
      choices: [
        { name: 'Architecture', value: 'architecture' },
        { name: 'Pattern', value: 'pattern' },
        { name: 'Discovery', value: 'discovery' },
        { name: 'Decision', value: 'decision' },
        { name: 'Bugfix', value: 'bugfix' },
        { name: 'Session', value: 'session' },
        { name: 'Release', value: 'release' },
      ]
    });
  }
  if (!desc) {
    desc = await input({ message: 'Breve descripción de lo que se resolvió o descubrió:' });
  }

  const validCategories = ['architecture', 'pattern', 'discovery', 'decision', 'bugfix', 'session', 'release'];
  if (category && !validCategories.includes(category)) {
    throw new Error(`Categoría inválida: ${category}. Las categorías válidas son: ${validCategories.join(', ')}`);
  }

  const typeMap = {
    architecture: 'ARCH',
    bugfix: 'BUG',
    discovery: 'DISCOVERY',
    decision: 'DECISION',
    pattern: 'PATTERN',
    session: 'SESSION',
    release: 'RELEASE',
  };
  const typeLabel = typeMap[category];

  const fileTag = sanitizeName(tag.replace(/^\[|\]$/g, ''));
  const safeTag = `[${fileTag}]`; 
  const fileName = `${fileTag}.md`;
  const engramDir = path.join(cwd, 'docs', 'engram', category);
  
  if (!fs.existsSync(engramDir)) {
    fs.mkdirSync(engramDir, { recursive: true });
  }

  const filePath = path.join(engramDir, fileName);
  const today = new Date().toISOString().split('T')[0];
  const content = `### [${typeLabel}][${fileTag}] ${desc}\n\n**Date:** ${today}\n**What:** \n**Why:** \n**Where:** \n**Learned:** \n`;
  fs.writeFileSync(filePath, content, 'utf8');

  const indexPath = path.join(cwd, 'docs', 'engram', 'index.md');
  if (!fs.existsSync(indexPath)) {
    const header = '# Engram Index\n\nDirectorio unificado de conocimientos, decisiones y patrones.\n\n';
    const categories = ['Architecture', 'Pattern', 'Discovery', 'Decision', 'Bugfix', 'Session', 'Release'];
    fs.writeFileSync(indexPath, header + categories.map(c => `## ${c}`).join('\n\n') + '\n\n', 'utf8');
  }

  let indexContent = fs.readFileSync(indexPath, 'utf8');
  const categoryHeader = `## ${category.charAt(0).toUpperCase() + category.slice(1)}`;
  const parts = indexContent.split(categoryHeader);
  const newEntry = `- [${safeTag} ${desc}](./${category}/${fileName})\n`;
  
  if (parts.length > 1) {
    const nextCategoryMatch = parts[1].match(/\n## /);
    if (nextCategoryMatch) {
      const idx = nextCategoryMatch.index;
      let before = parts[1].substring(0, idx);
      const after = parts[1].substring(idx);
      if (!before.endsWith('\n')) before += '\n';
      indexContent = parts[0] + categoryHeader + before + newEntry + after;
    } else {
      let before = parts[1];
      if (!before.endsWith('\n')) before += '\n';
      indexContent = parts[0] + categoryHeader + before + newEntry;
    }
    fs.writeFileSync(indexPath, indexContent, 'utf8');
  }

  return { success: true, path: filePath };
};

const engramAddCommand = new Command('add')
  .description('Agrega un nuevo engrama al sistema')
  .option('-t, --tag <tag>', 'Tag identificador del engrama')
  .option('-c, --category <category>', 'Categoría (architecture, pattern, discovery, decision, bugfix, session, release)')
  .option('-d, --desc <desc>', 'Breve descripción del engrama')
  .action(async (options) => {
    try {
      const result = await runEngramAdd({
        tag: options.tag,
        category: options.category,
        desc: options.desc,
        cwd: process.cwd()
      });
      if (result.success) {
        console.log(`✅ Engrama guardado exitosamente en: ${result.path}`);
      }
    } catch (err) {
      console.error(`❌ Error al guardar el engrama: ${err.message}`);
      process.exit(1);
    }
  });

export const engramCommand = new Command('engram')
  .description('Gestiona la base de conocimientos y engramas (Sharding)')
  .addCommand(engramAddCommand);
