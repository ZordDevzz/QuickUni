# Excel Template Generation Service Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a service that generates an Excel template with fixed and dynamic headers for admin onboarding.

**Architecture:** A standalone service module using `xlsx` to create workbooks, worksheets, and instruction sheets, returning a Node.js Buffer.

**Tech Stack:** TypeScript, `xlsx` (SheetJS), Vitest.

---

### Task 1: Initialize Excel Service and Write Failing Test

**Files:**
- Create: `src/services/excel.ts`
- Create: `src/services/excel.test.ts`

- [ ] **Step 1: Create the service file with an empty function**

```typescript
import * as XLSX from "xlsx";

export async function generateOnboardingTemplate(fields: { label: string, name: string, isRequired: boolean }[]) {
  // To be implemented
  return Buffer.from("");
}
```

- [ ] **Step 2: Write the failing test**

```typescript
import { describe, it, expect } from "vitest";
import { generateOnboardingTemplate } from "./excel";
import * as XLSX from "xlsx";

describe("excel service", () => {
  it("should generate a valid excel buffer with correct headers", async () => {
    const dynamicFields = [
      { label: "Phone Number", name: "phone", isRequired: true },
      { label: "Major", name: "major", isRequired: false },
    ];

    const buffer = await generateOnboardingTemplate(dynamicFields);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);

    const workbook = XLSX.read(buffer, { type: "buffer" });
    expect(workbook.SheetNames).toContain("Template");
    expect(workbook.SheetNames).toContain("Instructions");

    const templateSheet = workbook.Sheets["Template"];
    const data = XLSX.utils.sheet_to_json(templateSheet, { header: 1 }) as string[][];
    const headers = data[0];

    const expectedFixedHeaders = ["Full Name", "Gender", "DOB", "National ID", "Address", "Ethnic", "Religious", "Entity Code"];
    const expectedDynamicHeaders = ["Phone Number", "Major"];
    const expectedAllHeaders = [...expectedFixedHeaders, ...expectedDynamicHeaders];

    expect(headers).toEqual(expectedAllHeaders);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test src/services/excel.test.ts`
Expected: FAIL (buffer length 0 or headers mismatch)

- [ ] **Step 4: Commit initial structure**

```bash
git add src/services/excel.ts src/services/excel.test.ts
git commit -m "test: add initial test for excel template generation"
```

### Task 2: Implement Excel Template Generation

**Files:**
- Modify: `src/services/excel.ts`

- [ ] **Step 1: Implement the logic in `generateOnboardingTemplate`**

```typescript
import * as XLSX from "xlsx";

export async function generateOnboardingTemplate(fields: { label: string, name: string, isRequired: boolean }[]) {
  const fixedHeaders = ["Full Name", "Gender", "DOB", "National ID", "Address", "Ethnic", "Religious", "Entity Code"];
  const dynamicHeaders = fields.map(f => f.label);
  const allHeaders = [...fixedHeaders, ...dynamicHeaders];

  const worksheet = XLSX.utils.aoa_to_sheet([allHeaders]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

  // Add Instructions Sheet
  const instructions = [
    ["Column", "Description", "Format / Options", "Required"],
    ["Full Name", "User's full name", "Text", "Yes"],
    ["Gender", "User's gender", "male / female / other", "Yes"],
    ["DOB", "Date of Birth", "YYYY-MM-DD (e.g., 2000-01-01)", "Yes"],
    ["National ID", "ID number or Passport", "Numeric string", "Yes"],
    ["Address", "Current living address", "Text", "No"],
    ["Ethnic", "Ethnic group", "Text", "No"],
    ["Religious", "Religious affiliation", "Text", "No"],
    ["Entity Code", "Student ID or Employee Code", "Text", "Yes"],
  ];

  // Add dynamic fields to instructions
  fields.forEach(f => {
    instructions.push([f.label, "Custom profile field", "Text", f.isRequired ? "Yes" : "No"]);
  });

  const instrSheet = XLSX.utils.aoa_to_sheet(instructions);
  XLSX.utils.book_append_sheet(workbook, instrSheet, "Instructions");

  // Optional: Simple column width adjustment
  const max_width = allHeaders.reduce((w, h) => Math.max(w, h.length), 15);
  worksheet["!cols"] = allHeaders.map(() => ({ wch: max_width }));

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return buffer as Buffer;
}
```

- [ ] **Step 2: Run tests to verify it passes**

Run: `npm test src/services/excel.test.ts`
Expected: PASS

- [ ] **Step 3: Commit implementation**

```bash
git add src/services/excel.ts
git commit -m "feat: implement excel template generation service"
```

### Task 3: Verify Instruction Sheet Details

**Files:**
- Modify: `src/services/excel.test.ts`

- [ ] **Step 1: Add a test case for Instruction sheet content**

```typescript
  it("should generate correct instruction sheet content", async () => {
    const dynamicFields = [{ label: "Special Field", name: "special", isRequired: true }];
    const buffer = await generateOnboardingTemplate(dynamicFields);
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const instrSheet = workbook.Sheets["Instructions"];
    const data = XLSX.utils.sheet_to_json(instrSheet, { header: 1 }) as string[][];

    expect(data[0]).toEqual(["Column", "Description", "Format / Options", "Required"]);
    
    // Check for a few fixed instructions
    expect(data.some(row => row[0] === "Full Name")).toBe(true);
    expect(data.some(row => row[0] === "Gender" && row[2].includes("male / female / other"))).toBe(true);
    
    // Check for dynamic instruction
    expect(data.some(row => row[0] === "Special Field" && row[3] === "Yes")).toBe(true);
  });
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `npm test src/services/excel.test.ts`
Expected: PASS

- [ ] **Step 3: Commit final tests**

```bash
git add src/services/excel.test.ts
git commit -m "test: verify instruction sheet content"
```
