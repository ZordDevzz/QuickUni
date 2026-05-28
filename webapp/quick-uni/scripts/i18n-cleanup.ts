// scripts/i18n-cleanup.ts
// This script reads the i18n-report.txt, extracts hard‑coded strings, generates translation keys,
// adds them to messages/en.json and messages/vi.json, and replaces the literals in source files
// with t('Common.<key>') calls. It also ensures each file imports useTranslations('Common') if needed.

import * as fs from 'fs';
import * as path from 'path';

const projectRoot = path.resolve(__dirname, '..');
const reportPath = path.join(projectRoot, 'i18n-report.txt');
const enPath = path.join(projectRoot, 'messages', 'en.json');
const viPath = path.join(projectRoot, 'messages', 'vi.json');

// Load existing translation files (or create empty objects)
function loadJson(p: string) {
  if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8')) as Record<string, any>;
  return {};
}
const enJson = loadJson(enPath);
const viJson = loadJson(viPath);

// Ensure a Common namespace exists
if (!enJson.Common) enJson.Common = {};
if (!viJson.Common) viJson.Common = {};

// Helper to create a safe key from a literal
function makeKey(literal: string): string {
  // Remove surrounding quotes if present and trim
  const cleaned = literal.replace(/^"|"$/g, '').trim();
  // Replace spaces and non‑alphanum with underscores, lower‑case
  return cleaned
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$|_{2,}/g, '')
    .substring(0, 50) || 'key';
}

// Parse report for lines like: [HARDCODE] <file>:<line> - "text"
const reportLines = fs.readFileSync(reportPath, 'utf8').split(/\r?\n/);
const entries: {file: string; line: number; literal: string}[] = [];
for (const line of reportLines) {
  const match = line.match(/\[HARDCODE\]\s+([^:]+):(\d+)\s+-\s+"(.+)"/);
  if (match) {
    const [, filePath, lineNum, literal] = match;
    entries.push({file: filePath, line: Number(lineNum), literal});
  }
}

// Process each entry
for (const {file, literal} of entries) {
  const absPath = path.resolve(file);
  if (!fs.existsSync(absPath)) continue;
  let content = fs.readFileSync(absPath, 'utf8');
  // If file already uses useTranslations('Common'), reuse t; else add import and hook
  const usesCommon = /useTranslations\(['"]Common['"]\)/.test(content);
  if (!usesCommon) {
    // Insert import after other imports (simple heuristic)
    const importRegex = /(import[^;]+;\s*)+/;
    const importMatch = content.match(importRegex);
    const insertPos = importMatch ? importMatch[0].length : 0;
    const importStmt = "import { useTranslations } from 'next-intl';\n";
    content = content.slice(0, insertPos) + importStmt + content.slice(insertPos);
    // Add const t = useTranslations('Common'); after function start (simple heuristic: after first function line)
    const funcMatch = content.match(/function\s+\w+\s*\([^)]*\)\s*\{[\r\n\s]*/);
    if (funcMatch) {
      const idx = funcMatch.index! + funcMatch[0].length;
      const hookStmt = "  const t = useTranslations('Common');\n";
      content = content.slice(0, idx) + hookStmt + content.slice(idx);
    }
  }

  // Generate a unique key
  let key = makeKey(literal);
  // Ensure uniqueness within Common namespace
  let uniqKey = key;
  let counter = 1;
  while (enJson.Common[uniqKey] !== undefined) {
    uniqKey = `${key}_${counter}`;
    counter++;
  }
  // Add to translation files
  enJson.Common[uniqKey] = literal.replace(/^"|"$/g, '');
  viJson.Common[uniqKey] = `TODO_${literal.replace(/^"|"$/g, '')}`; // placeholder

  // Replace literal occurrences in the source file (global replace of the exact string)
  // Escape literal for RegExp
  const escaped = literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'g');
  content = content.replace(regex, `{t('${uniqKey}')}`);

  // Write back the file
  fs.writeFileSync(absPath, content, 'utf8');
}

// Write updated translation files
fs.writeFileSync(enPath, JSON.stringify(enJson, null, 2), 'utf8');
fs.writeFileSync(viPath, JSON.stringify(viJson, null, 2), 'utf8');

console.log('i18n cleanup completed. Updated', entries.length, 'entries.');
