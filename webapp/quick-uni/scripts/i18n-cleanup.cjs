// scripts/i18n-cleanup.cjs
// Updated to strip leading line numbers from i18n-report.txt lines.
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const reportPath = path.join(projectRoot, 'i18n-report.txt');
const enPath = path.join(projectRoot, 'messages', 'en.json');
const viPath = path.join(projectRoot, 'messages', 'vi.json');

function loadJson(p) {
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
}
const enJson = loadJson(enPath);
const viJson = loadJson(viPath);

if (!enJson.Common) enJson.Common = {};
if (!viJson.Common) viJson.Common = {};

function makeKey(literal) {
  const cleaned = literal.replace(/^"|"$/g, '').trim();
  return cleaned
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$|_{2,}/g, '')
    .substring(0, 50) || 'key';
}

const rawLines = fs.readFileSync(reportPath, 'utf8').split(/\r?\n/);
const entries = [];
for (let rawLine of rawLines) {
  // Strip leading line number like "123: " if present
  const line = rawLine.replace(/^\s*\d+:\s*/, '');
  const match = line.match(/\[HARDCODE\]\s+([^:]+):(\d+)\s+-\s+"(.+)"/);
  if (match) {
    const [, filePath, lineNum, literal] = match;
    entries.push({file: filePath, line: Number(lineNum), literal});
  }
}

entries.forEach(({file, literal}) => {
  const absPath = path.resolve(file);
  if (!fs.existsSync(absPath)) return;
  let content = fs.readFileSync(absPath, 'utf8');

  const usesCommon = /useTranslations\(['"]Common['"]\)/.test(content);
  if (!usesCommon) {
    // Add import after existing imports (simple heuristic)
    const importSectionMatch = content.match(/^(import[^;]+;\s*)+/m);
    const insertPos = importSectionMatch ? importSectionMatch[0].length : 0;
    const importStmt = "import { useTranslations } from 'next-intl';\n";
    content = content.slice(0, insertPos) + importStmt + content.slice(insertPos);
    // Insert hook after first function declaration
    const funcMatch = content.match(/function\s+\w+\s*\([^)]*\)\s*\{[\r\n\s]*/);
    if (funcMatch) {
      const idx = funcMatch.index + funcMatch[0].length;
      const hookStmt = "  const t = useTranslations('Common');\n";
      content = content.slice(0, idx) + hookStmt + content.slice(idx);
    }
  }

  // Generate unique key within Common namespace
  let key = makeKey(literal);
  let uniqKey = key;
  let counter = 1;
  while (enJson.Common[uniqKey] !== undefined) {
    uniqKey = `${key}_${counter}`;
    counter++;
  }
  enJson.Common[uniqKey] = literal.replace(/^"|"$/g, '');
  viJson.Common[uniqKey] = `TODO_${literal.replace(/^"|"$/g, '')}`;

  const escaped = literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'g');
  content = content.replace(regex, `{t('${uniqKey}')}`);

  fs.writeFileSync(absPath, content, 'utf8');
});

fs.writeFileSync(enPath, JSON.stringify(enJson, null, 2), 'utf8');
fs.writeFileSync(viPath, JSON.stringify(viJson, null, 2), 'utf8');

console.log('i18n cleanup completed. Updated', entries.length, 'entries.');
