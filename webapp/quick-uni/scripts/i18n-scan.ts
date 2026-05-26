import { Project, SyntaxKind } from "ts-morph";
import * as fs from "fs";
import * as path from "path";
import { flattenObject } from "./utils/flatten";

const MESSAGES_DIR = path.join(process.cwd(), "messages");
const SRC_DIR = path.join(process.cwd(), "src");

// 1. Read Messages
const languages = ["en", "vi"];
const i18nData = new Map<string, Set<string>>();

languages.forEach(lang => {
  const filePath = path.join(MESSAGES_DIR, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const flattened = flattenObject(raw);
    i18nData.set(lang, new Set(Object.keys(flattened)));
  } else {
    i18nData.set(lang, new Set());
  }
});

// 2. Initialize ts-morph
const project = new Project({
  tsConfigFilePath: path.join(process.cwd(), "tsconfig.json"),
});
project.addSourceFilesAtPaths(`${SRC_DIR}/**/*.{ts,tsx}`);

console.log(`Loaded ${project.getSourceFiles().length} files.`);
