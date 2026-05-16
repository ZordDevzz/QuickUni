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
