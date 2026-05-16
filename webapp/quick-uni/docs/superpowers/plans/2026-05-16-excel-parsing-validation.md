# Excel Parsing & Validation Logic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Excel parsing and validation for the admin onboarding redesign.

**Architecture:** Add `parseAndValidateOnboardingExcel` to `src/services/excel.ts` which reads an uploaded Excel file, validates fixed and dynamic fields, and returns parsed data with validation errors if any. Tests will be added to `src/services/excel.test.ts`.

**Tech Stack:** TypeScript, Node.js, `xlsx` library, Vitest.

---

### Task 1: Implement Parsing and Validation Logic

**Files:**
- Modify: `src/services/excel.ts`

- [ ] **Step 1: Add `parseAndValidateOnboardingExcel`**
Implement the function to read the buffer, extract the "Template" sheet, and validate each row.

```typescript
export async function parseAndValidateOnboardingExcel(buffer: Buffer, fields: { label: string, name: string, isRequired: boolean }[]) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets["Template"] || workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(sheet);
  
  return rawData.map((row: any) => {
    const errors: string[] = [];
    
    // Fixed validations
    if (!row["Full Name"]) errors.push("Missing required field: Full Name");
    if (!row["National ID"]) errors.push("Missing required field: National ID");
    if (!row["Entity Code"]) errors.push("Missing required field: Entity Code");
    
    // Dynamic validations
    fields.forEach(f => {
      if (f.isRequired && !row[f.label]) {
        errors.push(`Missing required field: ${f.label}`);
      }
    });

    return {
      data: row,
      errors,
      isValid: errors.length === 0
    };
  });
}
```

### Task 2: Add Tests for Parsing and Validation

**Files:**
- Modify: `src/services/excel.test.ts`

- [ ] **Step 1: Write tests for `parseAndValidateOnboardingExcel`**

```typescript
  it("should correctly parse and validate onboarding excel data", async () => {
    const dynamicFields = [
      { label: "Phone Number", name: "phone", isRequired: true },
      { label: "Major", name: "major", isRequired: false },
    ];

    // Create a mock excel buffer with valid and invalid data
    const headers = ["Full Name", "Gender", "DOB", "National ID", "Address", "Ethnic", "Religious", "Entity Code", "Phone Number", "Major"];
    const validRow = ["John Doe", "male", "2000-01-01", "123456789", "123 Street", "Kinh", "None", "STU001", "0987654321", "CS"];
    const invalidRow = ["Jane Doe", "female", "2001-01-01", undefined, "456 Ave", "Kinh", "None", "STU002", undefined, "IT"]; // Missing National ID and Phone Number

    const worksheet = XLSX.utils.aoa_to_sheet([headers, validRow, invalidRow]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;

    const result = await parseAndValidateOnboardingExcel(buffer, dynamicFields);

    expect(result).toHaveLength(2);
    
    // Valid row
    expect(result[0].isValid).toBe(true);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].data["Full Name"]).toBe("John Doe");

    // Invalid row
    expect(result[1].isValid).toBe(false);
    expect(result[1].errors).toContain("Missing required field: National ID");
    expect(result[1].errors).toContain("Missing required field: Phone Number");
  });
```

- [ ] **Step 2: Run tests**

Run: `npm test src/services/excel.test.ts`
Expected: PASS
