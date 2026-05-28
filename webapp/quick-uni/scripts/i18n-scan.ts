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

const hardcodedTexts: string[] = [];
const missingKeys: string[] = [];

// Props that commonly have UI text
const TEXT_PROPS = ["placeholder", "title", "alt", "aria-label", "label", "description"];

project.getSourceFiles().forEach(sourceFile => {
  const filePath = sourceFile.getFilePath().replace(process.cwd(), "");

  // Detect Hardcoded Text in JSX
  sourceFile.forEachDescendant(node => {
    // 1. JsxText
    if (node.getKind() === SyntaxKind.JsxText) {
      const text = node.getText().trim();
      // Only record if it contains letters (ignore just symbols/spaces)
      if (text.length > 0 && /[a-zA-Z]/.test(text)) {
        hardcodedTexts.push(`[HARDCODE] ${filePath}:${node.getStartLineNumber()} - "${text}"`);
      }
    }

    // 2. JSX Attributes (Props)
    if (node.getKind() === SyntaxKind.JsxAttribute) {
      const attrName = node.getFirstChildByKind(SyntaxKind.Identifier)?.getText();
      if (attrName && TEXT_PROPS.includes(attrName)) {
        const initializer = node.getFirstChildByKind(SyntaxKind.StringLiteral);
        if (initializer) {
          const text = initializer.getLiteralText();
          if (text.length > 0) {
            hardcodedTexts.push(`[HARDCODE] ${filePath}:${node.getStartLineNumber()} - Prop '${attrName}': "${text}"`);
          }
        }
      }
    }
  });

  // Detect Missing Keys
  // Map translation function variable names to their namespaces
  const tNamespaceMap = new Map<string, string>(); // variableName -> namespace
  
  // Find all variable declarations calling useTranslations
  sourceFile.getDescendantsOfKind(SyntaxKind.VariableDeclaration).forEach(varDecl => {
    const initializer = varDecl.getInitializerIfKind(SyntaxKind.CallExpression);
    if (initializer && initializer.getExpression().getText() === "useTranslations") {
      const args = initializer.getArguments();
      const varName = varDecl.getName();
      if (args.length > 0 && args[0].getKind() === SyntaxKind.StringLiteral) {
        const namespace = args[0].getText().replace(/["']/g, "");
        tNamespaceMap.set(varName, namespace);
      } else {
        // If useTranslations() is called without arguments, namespace is empty/global
        tNamespaceMap.set(varName, "");
      }
    }
  });

  // Find t("key") or translationFn("key") calls
  const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
  callExpressions.forEach(callExpr => {
    const exprText = callExpr.getExpression().getText();
    if (tNamespaceMap.has(exprText)) {
      const namespace = tNamespaceMap.get(exprText)!;
      const args = callExpr.getArguments();
      if (args.length > 0 && args[0].getKind() === SyntaxKind.StringLiteral) {
        const key = args[0].getText().replace(/["']/g, "");
        const fullKey = namespace ? `${namespace}.${key}` : key;
        
        // Check against i18n data
        const missingIn: string[] = [];
        languages.forEach(lang => {
          const keysSet = i18nData.get(lang);
          if (keysSet && !keysSet.has(fullKey)) {
            missingIn.push(`${lang}.json`);
          }
        });

        if (missingIn.length > 0) {
          missingKeys.push(`[MISSING] ${filePath}:${callExpr.getStartLineNumber()} - Key "${fullKey}" is missing in: ${missingIn.join(", ")}`);
        }
      }
    }
  });
});

// 3. Write Output
const reportContent = [
  "=== I18N SCANNER REPORT ===",
  `Date: ${new Date().toISOString()}`,
  "",
  "--- HARDCODED TEXT ---",
  hardcodedTexts.length > 0 ? hardcodedTexts.join("\n") : "None found.",
  "",
  "--- MISSING KEYS ---",
  missingKeys.length > 0 ? missingKeys.join("\n") : "None found."
].join("\n");

fs.writeFileSync(path.join(process.cwd(), "i18n-report.txt"), reportContent);
console.log(`Scan complete! Found ${hardcodedTexts.length} hardcoded texts and ${missingKeys.length} missing keys.`);
console.log(`Report written to i18n-report.txt`);
