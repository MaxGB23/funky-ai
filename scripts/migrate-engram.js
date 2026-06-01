import fs from 'fs';
import path from 'path';

const ENGRAM_DIR = path.join(process.cwd(), 'docs', 'engram');
const DISCOVERIES_FILE = path.join(ENGRAM_DIR, 'discoveries.md');
const BUGFIXES_FILE = path.join(ENGRAM_DIR, 'bugfixes.md');
const INDEX_FILE = path.join(ENGRAM_DIR, 'index.md');

const DIRS = {
  architecture: path.join(ENGRAM_DIR, 'architecture'),
  pattern: path.join(ENGRAM_DIR, 'pattern'),
  discovery: path.join(ENGRAM_DIR, 'discovery'),
  decision: path.join(ENGRAM_DIR, 'decision'),
  bugfix: path.join(ENGRAM_DIR, 'bugfix')
};

// Create dirs
Object.values(DIRS).forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function parseFile(filePath, defaultCategory) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf-8');
  // Split by '### '
  const blocks = content.split('\n### ');
  const entries = [];
  
  // The first block is usually the header/description
  for (let i = 1; i < blocks.length; i++) {
    const block = '### ' + blocks[i];
    const lines = block.trim().split('\n');
    const header = lines[0];
    
    // Default fallback
    let category = defaultCategory;
    
    if (header.toLowerCase().includes('[bugfix]')) category = 'bugfix';
    else if (header.toLowerCase().includes('[decision]')) category = 'decision';
    else if (header.toLowerCase().includes('[pattern]')) category = 'pattern';
    else if (header.toLowerCase().includes('[architecture]')) category = 'architecture';
    else if (header.toLowerCase().includes('[discovery]')) category = 'discovery';

    // Generate a filename
    const safeName = header
      .replace(/^###\s*/, '')
      .replace(/\[.*?\]/g, '') // remove tags
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .toLowerCase() || `entry-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const filename = `${safeName}.md`;
    
    entries.push({
      category,
      filename,
      content: block.trim(),
      header
    });
  }
  return entries;
}

const allEntries = [
  ...parseFile(DISCOVERIES_FILE, 'discovery'),
  ...parseFile(BUGFIXES_FILE, 'bugfix')
];

let indexContent = `# Engram Index\n\nDirectorio unificado de conocimientos, decisiones y patrones.\n\n`;

const categorized = {
  architecture: [], pattern: [], discovery: [], decision: [], bugfix: []
};

allEntries.forEach(entry => {
  const destDir = DIRS[entry.category] || DIRS.discovery;
  const destPath = path.join(destDir, entry.filename);
  fs.writeFileSync(destPath, entry.content);
  
  if (categorized[entry.category]) {
    categorized[entry.category].push(entry);
  }
});

// Build index
for (const [cat, entries] of Object.entries(categorized)) {
  indexContent += `## ${cat.charAt(0).toUpperCase() + cat.slice(1)}\n`;
  entries.forEach(e => {
    indexContent += `- [${e.header.replace(/^###\s*/, '')}](./${cat}/${e.filename})\n`;
  });
  indexContent += `\n`;
}

fs.writeFileSync(INDEX_FILE, indexContent);

// Remove old files
if (fs.existsSync(DISCOVERIES_FILE)) fs.unlinkSync(DISCOVERIES_FILE);
if (fs.existsSync(BUGFIXES_FILE)) fs.unlinkSync(BUGFIXES_FILE);

console.log('✅ Engram migrated successfully!');
