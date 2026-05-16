import * as XLSX from "xlsx";

/**
 * Generates an Excel template for admin onboarding.
 * Includes fixed profile fields and dynamic fields from the chosen schema.
 */
export async function generateOnboardingTemplate(fields: { label: string, name: string, isRequired: boolean }[]) {
  const fixedHeaders = ["Full Name", "Gender", "DOB", "National ID", "Address", "Ethnic", "Religious", "Entity Code"];
  const dynamicHeaders = fields.map(f => f.label);
  const allHeaders = [...fixedHeaders, ...dynamicHeaders];

  // 1. Create Template Sheet
  const worksheet = XLSX.utils.aoa_to_sheet([allHeaders]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

  // 2. Create Instructions Sheet
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

  // 3. Set Column Widths for readability
  const max_width = allHeaders.reduce((w, h) => Math.max(w, h.length), 15);
  worksheet["!cols"] = allHeaders.map(() => ({ wch: max_width }));
  
  // Also set widths for Instructions sheet
  instrSheet["!cols"] = [
    { wch: 20 }, // Column
    { wch: 30 }, // Description
    { wch: 30 }, // Format
    { wch: 10 }  // Required
  ];

  // 4. Write to Buffer
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return buffer as Buffer;
}
